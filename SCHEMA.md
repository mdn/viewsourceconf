# JSON data model reference

## *sponsors.json ##
{
    "premier": {
        "Premium Sponsor 1": {
            "url": "http://example.com",
            "image": "alpineinternet.gif"
        },
    },
    "gold": {
        "Gold Sponsor 1": {
            "url": "http://example.com",
            "image": "alpineinternet.gif"
        },
    },
    "silver": {
        "Silver Sponsor 1": {
            "url": "http://example.com",
            "level": "silver",
            "image": "alpineinternet.gif"
        },
    },
    "other": {
        "Other Sponsor 1": {
            "url": "http://example.com",
            "level": "other",
            "image": "alpineinternet.gif"
        },
    }
}


## *venue.json ##
{
    "meta": {
        "name": "RADIALSYSTEM V",
        "address": "Holzmarktstraße 33, 10243 Berlin, Germany",
        "map_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2428.2786856721473!2d13.426430615483964!3d52.510295444701235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84e3900263f87%3A0xf3893f5141a5c0fc!2sRADIALSYSTEM+V!5e0!3m2!1sen!2sus!4v1458849251146",
        "blurb": "Some arbitrary text"
    },
    "travel": {
        "blurb": "Some arbitrary text",
        "modes": {
            "Mode": "Some arbitrary text",
        }
    },
    "hotels": {
        "Ibis Hotel (Ibis Berlin Ostbahnhof)": {
            "url": "http://www.hotel.info/en/ibis-berlin-ostbahnhof/hotel-118587/",
            "stars": [1,1],
            "rate": "€94,00 for a single room - preferential rate can only be guaranteed until 18 July 2016 - rooms subject to availability",
            "address": "An der Schillingbrücke 2, 10243 Berlin",
            "map_link": "https://goo.gl/maps/rZ8DNBCG2Hu",
            "how_to_book": "Contact Daniela Schneider",
            "email": "h3108@accor.com",
            "phone": "+49 30 257600",
            "reference": "View Source 2016"
        },
    }
}


## *sessions.json ##

[
  {
    "slug": "more-to-come",
    "title": "Stay tuned...",
    "time": "",
    "date": "2016-09-12",
    "summary": "We're still working on a full schedule of incredible talks, sessions and social events. Check back soon!",
    "keynote": false,
    "place": "",
    "speakers": [
        "speaker-slug"
    ],
    "feature": false
  },
  {...}
]

## *speakers.json ##
[
    {
      "slug" : "lena-reinhard",
      "first" : "Lena",
      "last" : "Reinhard",
      "feature": true,
      "twitter" : "",
      "pic" : "lenareinhard.jpg",
      "bio" : "Lena Reinhard is a consultant, team leader, and former CEO with an interdisciplinary background. She has co-founded a software company and contributed to the Open Source projects Hoodie and Apache CouchDB. Lena has also co-organised tech conferences and has been an editor for the feminist blog Kleinerdrei.org. Through her work, Lena aims to support change in the tech industry to make it more accessible, diverse and inclusive. She currently lives in Berlin and really loves Alpacas.",
      "sessions" : []
    },
    {...}
]
