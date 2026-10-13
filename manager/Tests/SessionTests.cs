using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // When the user's own YouTube sign-in is worth a try (Session.MayHelp).
    [TestClass]
    public class SessionTests
    {
        static Fail BotCheck() => new Fail(Errors.Classify(Fixture.Text("stderr", "not-a-bot.txt")).key, Errors.Classify(Fixture.Text("stderr", "not-a-bot.txt")).vars);

        [TestMethod]
        public void BotCheckIsMarked()
        {
            var (_, key, vars) = Errors.Classify(Fixture.Text("stderr", "not-a-bot.txt"));
            Assert.AreEqual("errBlocked", key);
            Assert.AreEqual(true, vars["bot"]);
        }

        [TestMethod]
        public void BotCheckGoesSignedInOnlyWhenTurnedOn()
        {
            var was = Settings.Current.SignInForBotCheck;
            try
            {
                Settings.Current.SignInForBotCheck = false;
                Assert.IsFalse(Session.MayHelp(BotCheck()));
                Settings.Current.SignInForBotCheck = true;
                Assert.IsTrue(Session.MayHelp(BotCheck()));
            }
            finally { Settings.Current.SignInForBotCheck = was; }
        }

        // Refused links (HTTP 403 again and again) are errBlocked too, but no sign-in changes those.
        [TestMethod]
        public void OtherBlocksNeverGoSignedIn()
        {
            var was = Settings.Current.SignInForBotCheck;
            try
            {
                Settings.Current.SignInForBotCheck = true;
                Assert.IsFalse(Session.MayHelp(new Fail("errBlocked")));
                Assert.IsFalse(Session.MayHelp(new Fail("errBlocked", new Dictionary<string, object> { ["bot"] = "yes" })));
                Assert.IsFalse(Session.MayHelp(new Fail("errNetwork")));
            }
            finally { Settings.Current.SignInForBotCheck = was; }
        }

        [DataTestMethod]
        [DataRow("errAge")]
        [DataRow("errMembers")]
        [DataRow("errPrivate")]
        public void AccountOnlyVideosAlwaysGoSignedIn(string key)
        {
            var was = Settings.Current.SignInForBotCheck;
            try
            {
                Settings.Current.SignInForBotCheck = false;
                Assert.IsTrue(Session.MayHelp(new Fail(key)));
            }
            finally { Settings.Current.SignInForBotCheck = was; }
        }
    }
}
