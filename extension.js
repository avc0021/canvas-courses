module.exports = {
    "name": "CanvasCard",
    "publisher": "University of the Incarnate Word",
    "cards": [{
        "type": "CanvasCardCard",
        "source": "./src/cards/CanvasCardCard",
        "title": "CanvasCard Card",
        "displayCardType": "CanvasCard Card",
        "description": "This is an introductory card to the Ellucian Experience SDK",
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['a']
        }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}