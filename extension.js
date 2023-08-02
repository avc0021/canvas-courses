module.exports = {
    "name": "Canvas",
    "publisher": "University of the Incarnate Word",
    "cards": [{
        "type": "Canvas",
        "source": "./src/cards/Canvascard",
        "title": "Canvas",
        "displayCardType": "Canvas Card",
        "description": "This card displays data from Canvas",
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['a']
        }
    }]
}