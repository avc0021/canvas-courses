module.exports = {
    "name": "CanvasCard",
    "publisher": "University of the Incarnate Word",
    "cards": [{
        "type": "Canvascard",
        "source": "./src/cards/Canvascard",
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