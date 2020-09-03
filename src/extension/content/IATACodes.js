// NOTE: List is currently organized alphabetically by `city`.
// NOTE: Country codes are accompanied by a three-letter code (alpha-3).
// NOTE: If the airport is in the USA, a `state` entry will be provided.

const IATACodes = {
  AAR: {
    city: "Aarhus",
    country: "Denmark",
    code: "DNK"
  },
  ABD: {
    city: "Abadan",
    country: "Iran",
    code: "IRN"
  },
  AEH: {
    city: "Abeche",
    country: "Chad",
    code: "TCD"
  },
  ABZ: {
    city: "Aberdeen",
    country: "United Kingdom",
    code: "GBR"
  },
  ABR: {
    city: "Aberdeen",
    country: "USA",
    state: "South Dakota",
    code: "USA"
  },
  ABJ: {
    city: "Abidjan",
    country: "Cote d'Ivoire",
    code: "CIV"
  },
  ABI: {
    city: "Abilene",
    country: "USA",
    state: "Texas",
    code: "USA"
  },
  // TODO add all remaining IATA codes.
  // SEE: https://www.nationsonline.org/oneworld/IATA_Codes/airport_code_list.htm
  // SEE: https://www.iso.org/obp/ui/#search
  // IATA codes below are out of order for demo purposes.
  AUS: {
    city: "Austin",
    country: "USA",
    state: "Texas",
    code: "USA"
  },
  IQT: {
    city: "Iquitos",
    country: "Peru",
    code: "PER"
  },
  LAS: {
    city: "Las Vegas",
    country: "USA",
    state: "Nevada",
    code: "USA"
  },
  LIM: {
    city: "Lima",
    country: "Peru",
    code: "PER"
  },
  LIS: {
    city: "Lisbon",
    country: "Portugal",
    code: "PRT"
  },
  LHR: {
    city: "London",
    country: "United Kingdom",
    code: "GBR"
  },
  LAX: {
    city: "Los Angeles",
    country: "USA",
    state: "California",
    code: "USA"
  },
  PDX: {
    city: "Portland",
    country: "USA",
    state: "Oregon",
    code: "USA"
  },
  SEA: {
    city: "Seattle",
    country: "USA",
    state: "Washington",
    code: "USA"
  },
  TUL: {
    city: "Tulsa",
    country: "USA",
    state: "Oklahoma",
    code: "USA"
  }
};

async function getAirportLocation(airportCode) {
  return IATACodes[airportCode];
};

export {
  getAirportLocation
};