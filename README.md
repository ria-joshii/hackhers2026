SMARTRANSFER 
Intelligent Routing for Cross-Border Money Movement


Inspiration: 

Sending money internationally is something millions of people do every day — yet the process is still opaque, fragmented, and confusing.

As international students who have lived across different countries, we’ve experienced this firsthand. We’ve used bank wires, remittance apps, digital wallets, and even crypto. Each method worked — but each came with trade-offs:

- Safe but slow  
- Fast but expensive  
- Cheap upfront but hidden FX spreads  
- Flexible but tax or volatility risk  

Every transfer required guesswork.

We kept asking:

> Why doesn’t sending money internationally feel like booking a flight?

When booking travel, you instantly compare price, time, and trade-offs.  
For cross-border transfers, no intelligent comparison layer exists.

So we built one.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

What We Built:

SmartTransfer is an AI-powered transfer routing engine.

Users input:

- Amount  
- Origin currency  
- Destination currency  
- Time preference  
- Risk tolerance  

The system compares:

- Bank wires  
- Wise  
- Western Union  
- PayPal  
- Remittance platforms  
- USDC on Ethereum  

And returns:

- 🏆 Best match  
- 💰 Total fee  
- 📊 FX markup  
- ⏱ Settlement time  
- 🧾 Tax flag indicators  

It’s Google Flights — but for money movement.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

⚙️ How It Works

1️⃣ FX & Normalization

All transfers are normalized into USD internally.  
We fetch live mid-market FX rates via the Frankfurter API and apply provider-specific markups or spreads.

This ensures apples-to-apples comparison across traditional finance and crypto rails.



2️⃣ Provider Simulation Engine

Each provider is modeled as a structured object with:

- Flat and percentage fees  
- FX markup or spread  
- Settlement time  
- Delivery constraints  
- Risk profile  

Traditional providers:

Total Fee = Flat Fee + % Fee + FX Markup  

Crypto providers:

Total Fee =  
On-ramp % + Gas Fee + Exchange % + Off-ramp % + FX Spread  

All routes are simulated and standardized for fair comparison.  
No real transactions are executed.



3️⃣ Adaptive Scoring Engine

Ranking adapts to user intent.

- Standard prioritizes cost  
- Express balances cost and speed  
- Same-day prioritizes speed  

Risk tolerance adjusts crypto weighting:

- Conservative penalizes crypto  
- Balanced slightly penalizes  
- Flexible allows crypto to compete  

This creates intent-aware routing — not just cheapest-first sorting.



4️⃣ Visualization Layer

Built in React with Recharts, the platform provides:

- Total fee comparison  
- FX spread visualization  
- Fee breakdown pie charts  
- Recipient value comparison  

Users don’t just see numbers — they see trade-offs.



5️⃣ AI Layer — Gemini

Gemini acts as a reasoning layer.

It explains:

- Why a route ranks highest  
- What trade-offs exist  
- Where costs are concentrated  
- Whether speed or risk drove the recommendation  

The math is deterministic.  
AI provides interpretation.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

What We Learned

- Most cost hides in FX markup, not flat fees  
- Speed can outweigh small fee differences  
- Crypto can be efficient — but risk context matters  
- Users want clarity, not just cost  

Optimization in global finance is multidimensional:

Cost × Speed × Risk × Timing

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Why It Matters

Cross-border transfers are high frequency and high impact — yet poorly understood.

SmartTransfer introduces an intelligent routing layer that:

- Reduces guesswork  
- Increases transparency  
- Adapts to user priorities  
- Bridges traditional finance and crypto  

We don’t replace providers.  
We help users choose intelligently between them.

International money movement should feel rational, transparent, and data-driven.

SmartTransfer makes that possible.
