const DEST_CURRENCIES = {
      INR: {
        symbol: "₹",
        name: "Indian Rupee",
        country: "India",
        flag: "🇮🇳",
        baseRateFromUSD: null,
      },
      EUR: {
        symbol: "€",
        name: "Euro",
        country: "Eurozone",
        flag: "🇪🇺",
        baseRateFromUSD: null,
      },
      GBP: {
        symbol: "£",
        name: "British Pound",
        country: "United Kingdom",
        flag: "🇬🇧",
        baseRateFromUSD: null,
      },
      MXN: {
        symbol: "$",
        name: "Mexican Peso",
        country: "Mexico",
        flag: "🇲🇽",
        baseRateFromUSD: null,
      },
      PHP: {
        symbol: "₱",
        name: "Philippine Peso",
        country: "Philippines",
        flag: "🇵🇭",
        baseRateFromUSD: null,
      },
      NGN: {
        symbol: "₦",
        name: "Nigerian Naira",
        country: "Nigeria",
        flag: "🇳🇬",
        baseRateFromUSD: null,
      },
      BRL: {
        symbol: "R$",
        name: "Brazilian Real",
        country: "Brazil",
        flag: "🇧🇷",
        baseRateFromUSD: null,
      },
      JPY: {
        symbol: "¥",
        name: "Japanese Yen",
        country: "Japan",
        flag: "🇯🇵",
        baseRateFromUSD: null,
      },
      PKR: {
        symbol: "₨",
        name: "Pakistani Rupee",
        country: "Pakistan",
        flag: "🇵🇰",
        baseRateFromUSD: null,
      },
      BDT: {
        symbol: "৳",
        name: "Bangladeshi Taka",
        country: "Bangladesh",
        flag: "🇧🇩",
        baseRateFromUSD: null,
      },
    };
    
    async function loadRates() {
      try {
        const res = await fetch("https://api.frankfurter.app/latest?from=USD");
        const data = await res.json();
        const rates = data.rates;
    
        Object.keys(DEST_CURRENCIES).forEach((code) => {
          if (rates[code]) {
            DEST_CURRENCIES[code].baseRateFromUSD = rates[code];
          }
        });
      } catch (err) {
        console.error("Failed to load exchange rates", err);
      }
    }
    
    loadRates();
    
    export default DEST_CURRENCIES;