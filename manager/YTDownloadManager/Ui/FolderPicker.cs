using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace YTDM
{
    // The regular Windows folder picker (the Explorer-style dialog with "New folder", Quick access,
    // drives and network locations). Only real file-system folders can be picked.
    static class FolderPicker
    {
        [ComImport, Guid("DC1C5A9C-E88A-4dde-A5A1-60F82A20AEF7")]
        class FileOpenDialogCo { }

        [ComImport, Guid("42f85136-db7e-439c-85f1-e4075d135fc8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
        interface IFileDialog
        {
            [PreserveSig] int Show(IntPtr parent);
            void SetFileTypes(uint count, IntPtr specs);
            void SetFileTypeIndex(uint index);
            void GetFileTypeIndex(out uint index);
            void Advise(IntPtr sink, out uint cookie);
            void Unadvise(uint cookie);
            void SetOptions(uint fos);
            void GetOptions(out uint fos);
            void SetDefaultFolder(IShellItem item);
            void SetFolder(IShellItem item);
            void GetFolder(out IShellItem item);
            void GetCurrentSelection(out IShellItem item);
            void SetFileName([MarshalAs(UnmanagedType.LPWStr)] string name);
            void GetFileName([MarshalAs(UnmanagedType.LPWStr)] out string name);
            void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string title);
            void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string text);
            void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string label);
            void GetResult(out IShellItem item);
            void AddPlace(IShellItem item, int where);
            void SetDefaultExtension([MarshalAs(UnmanagedType.LPWStr)] string ext);
            void Close(int hr);
            void SetClientGuid(ref Guid guid);
            void ClearClientData();
            void SetFilter(IntPtr filter);
        }

        [ComImport, Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
        interface IShellItem
        {
            void BindToHandler(IntPtr pbc, ref Guid bhid, ref Guid riid, out IntPtr ppv);
            void GetParent(out IShellItem item);
            void GetDisplayName(uint sigdn, [MarshalAs(UnmanagedType.LPWStr)] out string name);
            void GetAttributes(uint mask, out uint attrs);
            void Compare(IShellItem other, uint hint, out int order);
        }

        [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
        static extern void SHCreateItemFromParsingName(string path, IntPtr pbc, [MarshalAs(UnmanagedType.LPStruct)] Guid riid, out IShellItem item);

        const uint FosNoChangeDir = 0x8, FosPickFolders = 0x20, FosForceFileSystem = 0x40, FosPathMustExist = 0x800;
        const uint SigdnFileSysPath = 0x80058000;
        const int ErrorCancelled = unchecked((int)0x800704C7);
        static readonly Guid ClientGuid = new Guid("6c1f3b3e-0f7a-4c52-9a0e-2b1d7f5e9c41");

        public static string Pick(IWin32Window owner, string title, string initial)
        {
            var dlg = (IFileDialog)new FileOpenDialogCo();
            try
            {
                dlg.GetOptions(out var o);
                dlg.SetOptions(o | FosPickFolders | FosForceFileSystem | FosPathMustExist | FosNoChangeDir);
                dlg.SetTitle(title);
                var g = ClientGuid;
                dlg.SetClientGuid(ref g);
                var start = ExistingAncestor(initial);
                if (start != null)
                {
                    try
                    {
                        SHCreateItemFromParsingName(start, IntPtr.Zero, typeof(IShellItem).GUID, out var item);
                        dlg.SetFolder(item);
                    }
                    catch { }
                }
                int hr = dlg.Show(owner?.Handle ?? IntPtr.Zero);
                if (hr == ErrorCancelled) return null;
                if (hr != 0) Marshal.ThrowExceptionForHR(hr);
                dlg.GetResult(out var result);
                result.GetDisplayName(SigdnFileSysPath, out var path);
                return path;
            }
            finally { Marshal.ReleaseComObject(dlg); }
        }

        static string ExistingAncestor(string path)
        {
            try
            {
                var p = string.IsNullOrWhiteSpace(path) ? null : Path.GetFullPath(path);
                while (p != null && !Directory.Exists(p)) p = Path.GetDirectoryName(p);
                return p;
            }
            catch { return null; }
        }
    }
}
