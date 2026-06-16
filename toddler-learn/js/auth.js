/* Tiny Explorers — simple sign-in gate.

   ⚠️ This is a CLIENT-SIDE gate only. The app is 100% static (no server), so the
   credentials live in this file and the check runs in the browser. That keeps
   casual users out, but it is NOT real security — anyone who views the page
   source can read the password or bypass the check. Do not use it to protect
   anything sensitive; for real auth you need a backend.

   Default credentials: username "admin", password "123456789".
   The signed-in state is kept in sessionStorage, so it clears when the browser
   tab/session closes (the user signs in again next visit). */
window.TE = window.TE || {};

TE.auth = (function () {
  var USER = "admin";
  var PASS = "123456789";
  var KEY = "te-auth";

  function isAuthed() {
    try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; }
  }
  function login(user, pass) {
    var ok = String(user || "").trim().toLowerCase() === USER && String(pass || "") === PASS;
    if (ok) { try { sessionStorage.setItem(KEY, "1"); } catch (e) {} }
    return ok;
  }
  function logout() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  return { isAuthed: isAuthed, login: login, logout: logout, user: USER };
})();

/* Wire the sign-in overlay (#signin-overlay). Runs at load: if already signed
   in this session it just reveals the app; otherwise it gates on the form. */
(function () {
  var overlay = document.getElementById("signin-overlay");
  if (!overlay) return;
  var form = document.getElementById("signin-form");
  var userEl = document.getElementById("signin-user");
  var passEl = document.getElementById("signin-pass");
  var errEl = document.getElementById("signin-err");

  // data-i18n only localizes textContent, so set input placeholders here.
  if (userEl) userEl.setAttribute("placeholder", TE.t("signInUser"));
  if (passEl) passEl.setAttribute("placeholder", TE.t("signInPass"));

  function reveal() { overlay.setAttribute("hidden", ""); }

  if (TE.auth.isAuthed()) { reveal(); return; }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (TE.auth.login(userEl.value, passEl.value)) {
        if (errEl) errEl.hidden = true;
        if (passEl) passEl.value = "";
        reveal();
      } else {
        if (errEl) { errEl.textContent = TE.t("signInErr"); errEl.hidden = false; }
        if (passEl) { passEl.value = ""; passEl.focus(); }
      }
    });
  }
  setTimeout(function () { if (userEl) userEl.focus(); }, 60);
})();
