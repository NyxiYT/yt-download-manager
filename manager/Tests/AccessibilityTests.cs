using System.Windows.Forms;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // What screen readers learn about the app's own controls.
    [TestClass]
    public class AccessibilityTests
    {
        [TestMethod]
        public void ToggleSaysWhetherItIsOn()
        {
            using (var t = new Toggle("Start with Windows"))
            {
                var a = t.AccessibilityObject;
                Assert.AreEqual(AccessibleRole.CheckButton, a.Role);
                Assert.AreEqual("Start with Windows", a.Name);
                Assert.IsFalse(a.State.HasFlag(AccessibleStates.Checked));
                t.Checked = true;
                Assert.IsTrue(a.State.HasFlag(AccessibleStates.Checked));
                Assert.IsTrue(string.IsNullOrEmpty(a.Description), "no English on/off text");
            }
        }

        [TestMethod]
        public void ToggleCanBeSwitchedByAScreenReader()
        {
            using (var t = new Toggle("x"))
            {
                int changed = 0;
                t.CheckedChanged += (s, e) => changed++;
                t.AccessibilityObject.DoDefaultAction();
                Assert.IsTrue(t.Checked);
                Assert.AreEqual(1, changed);
            }
        }

        [DataTestMethod]
        [DataRow(0.0, "0%")]
        [DataRow(0.424, "42%")]
        [DataRow(1.0, "100%")]
        public void SlimBarIsAProgressBarInPercent(double value, string shown)
        {
            using (var b = new SlimBar())
            {
                b.Value = value;
                Assert.AreEqual(AccessibleRole.ProgressBar, b.AccessibilityObject.Role);
                Assert.AreEqual(shown, b.AccessibilityObject.Value);
            }
        }

        [TestMethod]
        public void FlatButtonsAreButtons() => Assert.AreEqual(AccessibleRole.PushButton, Ui.Button("Close", null, true).AccessibilityObject.Role);
    }
}
