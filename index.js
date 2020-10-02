const axios = require('axios');

// Get the PPP conversion rate for the country
function getQuandlApiUrl(countryCodeIsoAlpha3) {
  const QuandlAPI = 'https://www.quandl.com/api/v3/';
  const getYear = () => new Date().getFullYear();
  const getLastYear = () => getYear() - 1;
  return `${QuandlAPI}datasets/ODA/${countryCodeIsoAlpha3}_PPPEX.json?start_date=${getLastYear()}-01-01&end_date=${getYear()}-01-01&api_key=${QuandlKey}`;
}

// Get additional country meta data (currencies and ISO Alpha3 code (needed for Quandl API))
async function fetchCountryMeta(countryCode) {
  const CountryMetaAPI = 'https://restcountries.eu/rest/v2/alpha/';
  const {
    data: { currencies, alpha3Code },
  } = await axios.get(`${CountryMetaAPI}${countryCode}`);
  return { currencies, alpha3Code };
}

// Returns the exchange rates
async function getExchangeRates() {
  const ExchangeRatesAPI = 'https://openexchangerates.org/api/latest.json';
  try {
    const {
      data: { rates },
    } = await axios.get(`${ExchangeRatesAPI}?app_id=${OpenExchangeKey}`);
    return rates;
  } catch (err) {
    console.error(`failed to get exchange rates`, err);
  }
}

// Get the purchasing power parity pricing for provided country codes
async function getPpp(countryCodes) {
  let results = [];
  const rates = await getExchangeRates();

  for (const cc of countryCodes) {
    const { currencies, alpha3Code } = await fetchCountryMeta(cc);
    const exchangeRate = rates[currencies[0].code];
    const {
      data: {
        dataset: { data },
      },
    } = await axios.get(getQuandlApiUrl(alpha3Code));

    // get the ppp conversion; the `data` value looks like this:
    // [ [ '2019-12-31', 0.566 ]]
    const pppConversion = data[0].pop();
    const pppConversionFactor = pppConversion / exchangeRate;

    // Calculate the local price
    const price = pppConversionFactor * 100;
    const percentOff = 100 - (100 * price) / 100;

    results.push({
      countryCode: cc,
      discountPercent: percentOff.toFixed(0),
    });
  }
  return results;
}

// creates a gumroad discount code.
async function createGumroadDiscountCode(
  productId,
  discountCodeName,
  amountOff,
  maxCount
) {
  const gumroadOfferCodesUrl = `https://api.gumroad.com/v2/products/${productId}/offer_codes`;
  try {
    const { data } = await axios.post(gumroadOfferCodesUrl, {
      access_token: GumroadToken,
      name: discountCodeName,
      amount_off: amountOff,
      // Hardcoding to percent
      offer_type: 'percent',
      max_purchase_count: maxCount,
      universal: false,
    });
    return data;
  } catch (err) {
    console.error(`failed to create discount code`, err);
  }
}

// SET THESE VALUES FIRST

// Get the API key from https://openexchangerates.org
const OpenExchangeKey = '';

// Get the API key from https://docs.quandl.com/
const QuandlKey = '';

// Get the token from https://gumroad.com/api#api-authentication
const GumroadToken = '';

// Get the Gumroad product ID from https://gumroad.com/api#products
// This is the product you will be creating discount codes for
const gumroadProductId = '';

// TODO: Add country codes you want to generate the discounts for
const countryCodes = ['BR'];

// Number of times the discount can be used
// Set to `undefined` for unlimited.
const maxOfferCodes = 100;

// Change this 'true' to create the offer codes
// and re-run the script. This is set to false, so you can
// tweak how your discount codes look like and actually see the
// discount amounts.
const CREATE_DISCOUNT_CODES = true;

if (!CREATE_DISCOUNT_CODES) {
  console.log(
    `Discount codes will not be created. Change CREATE_DISCOUNT_CODES to 'true' to create them.`
  );
}

getPpp(countryCodes).then(async (results) => {
  for (const r of results) {
    const rnd = Math.random().toString(36).substring(7);

    // The discount codes are named using the two letter country code and
    // an appended random string. For example "BR-0gnerc".
    const discountName = `${r.countryCode}-${rnd}`;

    if (CREATE_DISCOUNT_CODES) {
      if (!gumroadProductId || !GumroadToken) {
        throw new Error('Make sure you set the Gumroad token and product id!');
      }
      const result = await createGumroadDiscountCode(
        gumroadProductId,
        discountName,
        r.discountPercent,
        maxOfferCodes
      );

      if (result.success) {
        console.log({
          name: discountName,
          amount_off: r.discountPercent,
          offer_type: 'percent',
          max_purchase_count: maxOfferCodes,
          universal: false,
        });
      } else {
        console.log(
          `Failed to create discount code ${discountName}: `,
          result.message
        );
      }
    } else {
      // Not creating anything in Gumroad
      console.log(`${r.countryCode} - ${r.discountPercent} - ${discountName}`);
    }
  }
});
