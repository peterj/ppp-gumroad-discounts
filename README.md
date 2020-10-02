# Purchasing Power Parity (PPP) Discount Code Generator for Gumroad

This script calculates the PPP discounts and creates the discount codes in Gumroad.

## What do I need to run this?

There are a couple of API keys you will need - all of the APIs are either free or have a free tier:

1. [Open Exchange Rates](https://openexchangerates.org/)
2. [Quandl](https://docs.quandl.com/)
3. [Gumroad API token](https://gumroad.com/api#api-authentication) (if you want to automatically create discount codes)
4. Gumroad Product ID s(see [Gumroad Products API](https://gumroad.com/api#products) on how to get this)

Before running anything, make sure you set these values in `index.js`.

## What values do I need to set?

Once you obtained all keys, open the `index.js` file and set them based on the table below.

| Setting | Variable name|
| --- | --- |
| Open Exchange Rates | `OpenExchangeKey` |
| Quandl | `QuandlKey` |
| Gumroad API token | `GumroadToken` |
| Gumroad product ID | `gumroadProductId` |


In addition to the API keys, you also have to set/change the following settings:

`countryCodes`: list of two-letter country codes you want to generate the discounts for 

`maxOfferCodes`: number of times each discount can be used (set to `undefined` for unlimited)

## How to run it?

Assuming you've set all of the above, you can run the script using `node index.js`.

If you haven't changed the `CREATE_DISCOUNT_CODES` variable, the script will give you a list of generated codes, that will look like this:

```
$ node index.js
Discount codes will not be created. Change CREATE_DISCOUNT_CODES to 'true' to create them.
BR - 64 - BR-r6i8c
IN - 75 - IN-m5x2a
CZ - 42 - CZ-2wctfd
SI - 29 - SI-soqci
```

To create the Gumroad discount codes, make sure you set the Gumroad token (`GumroadToken`) and the Gumroad product ID (`gumroadProductId`). Then, set the `CREATE_DISCOUNT_CODES` variable to `true` and re-run the script.

>The script will create PERCENTAGE discounts. Refer to the Gumroad API if you want to use the fixed amount instead. 

Here's how the output will look like this time (if there's no errors):

```
$ node index.js
{
  name: 'BR-glx1k6',
  amount_off: '64',
  offer_type: 'percent',
  max_purchase_count: 100,
  universal: false
}
{
  name: 'IN-xtb007',
  amount_off: '75',
  offer_type: 'percent',
  max_purchase_count: 100,
  universal: false
}
{
  name: 'CZ-ggahj4',
  amount_off: '42',
  offer_type: 'percent',
  max_purchase_count: 100,
  universal: false
}
{
  name: 'SI-dr34dg',
  amount_off: '29',
  offer_type: 'percent',
  max_purchase_count: 100,
  universal: false
}
```
