var observer = new MutationObserver(function(mutations) {
        var upgrade = false;

        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
                upgrade = true;
                break;
            }
        }
        if (upgrade) {
            // If there is at least a new element, upgrade the DOM.
            // Note: upgrading elements one by one seems to insert bugs in MDL
            window.componentHandler.upgradeDom();
        }
    });
observer.observe(document, {
    childList : true,
    subtree : true
});
