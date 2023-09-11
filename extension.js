module.exports = {
    "name": "Canvas",
    "publisher": "University of the Incarnate Word",
    "cards": [{
        "type": "Canvas",
        "source": "./src/cards/Canvascard",
        "title": "Canvas",
        "displayCardType": "Canvas Card",
        "description": "This card displays data from Canvas",
        queries: {
            'list-persons': [
                {
                    resourceVersions: {
                        persons: { min: 12 }
                    },
                    query:
                        `query listPerson($personId: ID){
                            persons: {persons} (
                                filter: {id: {EQ: $personId}}
                                ) 
                                {
                                    edges {
                                        node {
                                            id
                                                credentials {
                                                    type
                                                    value
                                                }
                                                names {
                                                    firstName
                                                    lastName
                                                    middleName
                                                    preference
                                                    fullName
                                                }
                                                emails {
                                                    type {
                                                        emailType
                                                    }
                                                    address
                                                    preference
                                                }
                                        }
                                    }
                                }
                        }`
                }
            ]
        }
    }]
}