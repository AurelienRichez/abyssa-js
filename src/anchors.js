
'use strict';


var ieButton, router;

function onMouseDown(evt) {
  // IE does not provide the correct event.button information on 'onclick' handlers 
  // but it does on mousedown/mouseup handlers.
  ieButton = (evt || window.event).button;

  var href = hrefForEvent(evt);

  if (href !== undefined)
    router.state(href);
}

function onMouseClick(evt) {
  var href = hrefForEvent(evt);

  if (href !== undefined) {
    if (evt.preventDefault) evt.preventDefault();
    else evt.returnValue = false;

    router.state(href);
  }
}

function hrefForEvent(evt) {
  evt = evt || window.event;

  var defaultPrevented = ('defaultPrevented' in evt)
    ? evt.defaultPrevented
    : (evt.returnValue === false);

  if (defaultPrevented || evt.metaKey || evt.ctrlKey || !isLeftButton(evt)) return;

  var target = evt.target || evt.srcElement;
  var anchor = anchorTarget(target);
  if (!anchor) return;

  if (evt.type == 'mousedown' && anchor.getAttribute('data-nav') != 'mousedown') return;

  var href = anchor.getAttribute('href');

  if (href.charAt(0) == '#') return;
  if (anchor.getAttribute('target') == '_blank') return;
  if (!isLocalLink(anchor)) return;

  return href;
}

function isLeftButton(evt) {
  evt = evt || window.event;
  var button = (evt.which !== undefined) ? evt.which : ieButton;
  return button == 1;
}

function anchorTarget(target) {
  while (target) {
    if (target.nodeName == 'A') return target;
    target = target.parentNode;
  }
}

function isLocalLink(anchor) {
  var hostname = anchor.hostname;
  var port = anchor.port;

  // IE10 and below can lose the hostname/port property when setting a relative href from JS
  if (!hostname) {
    var tempAnchor = document.createElement("a");
    tempAnchor.href = anchor.href;
    hostname = tempAnchor.hostname;
    port = tempAnchor.port;
  }

  var sameHostname = (hostname == location.hostname);
  var samePort = (port || '80') == (location.port || '80');

  return sameHostname && samePort;
}


module.exports = function interceptAnchors(forRouter) {
  router = forRouter;

  if (document.addEventListener) {
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('click', onMouseClick);
  }
  else {
    document.attachEvent('onmousedown', onMouseDown);
    document.attachEvent('onclick', onMouseClick);
  }
};