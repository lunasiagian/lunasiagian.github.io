/* ============================================================
   Shared FX controller — CRT overlay, boot sweep, and
   channel-switch transition on internal navigation.
   Opt in per page:
     <body data-fx data-boot="full">   (home: full boot)
     <body data-fx>                    (others: quick signal-in)
   Respects prefers-reduced-motion (skips all motion).
   ============================================================ */
(function(){
  var body=document.body;
  if(!body.hasAttribute("data-fx")) return;

  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* persistent CRT scanline + vignette overlay — screens only (data-crt) */
  if(body.hasAttribute("data-crt")){
    var crt=document.createElement("div");
    crt.id="fx-crt";
    body.appendChild(crt);
  }

  /* shared veil for boot + wipe */
  var veil=document.createElement("div");
  veil.id="fx-veil";
  veil.innerHTML='<div class="glitch"></div><div class="bar"></div><div class="label">SIGNAL ACQUIRED</div>';
  body.appendChild(veil);

  /* ---- BOOT on load (full sequence on home, once per tab session) ---- */
  if(!reduce){
    var full=body.getAttribute("data-boot")==="full";
    var already=sessionStorage.getItem("fx-booted");
    if(full && !already){
      veil.classList.add("boot");
      sessionStorage.setItem("fx-booted","1");
      setTimeout(function(){veil.classList.remove("boot");}, 1300);
    }
  }

  /* ---- channel-switch glitch on internal navigation ---- */
  function isInternal(a){
    if(!a) return false;
    var href=a.getAttribute("href");
    if(!href) return false;
    if(a.target==="_blank") return false;
    if(/^(https?:)?\/\//i.test(href)){            /* absolute → only same host */
      return a.hostname===location.hostname;
    }
    if(href.charAt(0)==="#") return false;          /* in-page anchor */
    if(/^(mailto:|tel:)/i.test(href)) return false;
    return true;                                    /* relative path */
  }

  document.addEventListener("click", function(e){
    if(reduce) return;
    if(e.defaultPrevented) return;                  /* let other handlers (e.g. card burst) own it */
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0) return;
    var a=e.target.closest && e.target.closest("a");
    if(!isInternal(a)) return;
    e.preventDefault();
    var href=a.getAttribute("href");
    veil.classList.add("wipe");
    setTimeout(function(){ window.location.href=href; }, 300);
  }, true);

  /* clear veil if returning via back/forward cache */
  window.addEventListener("pageshow", function(){ veil.classList.remove("wipe","boot"); });
})();
