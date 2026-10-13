using System;
using System.Linq;
using System.Numerics;
using System.Security.Cryptography;

namespace YTDM
{
    // Ed25519 signature checking (RFC 8032, section 5.1.7), for the signed checksums of app updates. .NET
    // Framework has no Ed25519 of its own, and the app takes no packages. Only verification, which handles
    // no secrets, so plain BigInteger arithmetic is fine; one check takes a few milliseconds.
    static class Ed25519
    {
        static readonly BigInteger P = BigInteger.Pow(2, 255) - 19;
        static readonly BigInteger L = BigInteger.Pow(2, 252) + BigInteger.Parse("27742317777372353535851937790883648493");
        static readonly BigInteger D = Mod(-121665 * Inv(121666));
        static readonly BigInteger SqrtM1 = BigInteger.ModPow(2, (P - 1) / 4, P);
        static readonly BigInteger[] B = BasePoint();

        static BigInteger Mod(BigInteger a)
        {
            var r = a % P;
            return r.Sign < 0 ? r + P : r;
        }

        static BigInteger Inv(BigInteger a) => BigInteger.ModPow(a, P - 2, P);

        // Points in extended coordinates (X, Y, Z, T), x = X/Z, y = Y/Z, x*y = T/Z.
        static BigInteger[] Add(BigInteger[] p, BigInteger[] q)
        {
            var a = Mod((p[1] - p[0]) * (q[1] - q[0]));
            var b = Mod((p[1] + p[0]) * (q[1] + q[0]));
            var c = Mod(2 * p[3] * q[3] * D);
            var d = Mod(2 * p[2] * q[2]);
            BigInteger e = b - a, f = d - c, g = d + c, h = b + a;
            return new[] { Mod(e * f), Mod(g * h), Mod(f * g), Mod(e * h) };
        }

        static BigInteger[] Mul(BigInteger s, BigInteger[] p)
        {
            var q = new BigInteger[] { 0, 1, 1, 0 }; // the neutral point
            while (s > 0)
            {
                if (!s.IsEven) q = Add(q, p);
                p = Add(p, p);
                s >>= 1;
            }
            return q;
        }

        static bool Equal(BigInteger[] p, BigInteger[] q) =>
            Mod(p[0] * q[2] - q[0] * p[2]) == 0 && Mod(p[1] * q[2] - q[1] * p[2]) == 0;

        // x from y and the sign bit; null when the bytes are no point on the curve.
        static BigInteger? RecoverX(BigInteger y, int sign)
        {
            if (y >= P) return null;
            var x2 = Mod((y * y - 1) * Inv(D * y * y + 1));
            if (x2.IsZero) return sign == 0 ? (BigInteger?)0 : null;
            var x = BigInteger.ModPow(x2, (P + 3) / 8, P);
            if (Mod(x * x - x2) != 0) x = Mod(x * SqrtM1);
            if (Mod(x * x - x2) != 0) return null;
            if ((int)(x & 1) != sign) x = P - x;
            return x;
        }

        static BigInteger[] Decompress(byte[] s)
        {
            if (s.Length != 32) return null;
            var b = (byte[])s.Clone();
            int sign = b[31] >> 7;
            b[31] &= 0x7f;
            var y = Little(b);
            var x = RecoverX(y, sign);
            return x == null ? null : new[] { x.Value, y, 1, Mod(x.Value * y) };
        }

        static BigInteger[] BasePoint()
        {
            var y = Mod(4 * Inv(5));
            var x = RecoverX(y, 0).Value;
            return new[] { x, y, 1, Mod(x * y) };
        }

        static BigInteger Little(byte[] b) => new BigInteger(b.Concat(new byte[] { 0 }).ToArray()); // unsigned, little-endian

        public static bool Verify(byte[] publicKey, byte[] message, byte[] signature)
        {
            if (publicKey == null || publicKey.Length != 32 || signature == null || signature.Length != 64 || message == null) return false;
            var a = Decompress(publicKey);
            var rBytes = signature.Take(32).ToArray();
            var r = Decompress(rBytes);
            if (a == null || r == null) return false;
            var s = Little(signature.Skip(32).ToArray());
            if (s >= L) return false; // only the one canonical form of each signature
            BigInteger h;
            using (var sha = SHA512.Create())
                h = Little(sha.ComputeHash(rBytes.Concat(publicKey).Concat(message).ToArray())) % L;
            return Equal(Mul(s, B), Add(r, Mul(h, a)));
        }
    }
}
