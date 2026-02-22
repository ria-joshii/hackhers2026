import { useState, useEffect, useMemo } from "react";
import { generateAIReview } from "./gemini";
import {
  LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

import LOGO_B64 from "./logo";
import DEST_CURRENCIES from "./currency";

const C = {
  primary:   "#1B4079",
  teal:      "#2E7D87",
  tealLight: "#4D9EA8",
  accent:    "#CBDF90",
  success:   "#3D9970",
  warn:      "#E8A838",
  error:     "#C0392B",
  bg:        "#EEF5FB",
  bgDeep:    "#E3EEF7",
  card:      "#FFFFFF",
  border:    "#D4E4F0",
  text:      "#1A2333",
  muted:     "#6B7A8D",
  subtle:    "#A0AABB",
};

const CURRENCIES = {
      USD: { symbol: "$", name: "US Dollar", country: "United States", flag: "🇺🇸" },
      EUR: { symbol: "€", name: "Euro", country: "Eurozone", flag: "🇪🇺" },
      GBP: {
        symbol: "£",
        name: "British Pound",
        country: "United Kingdom",
        flag: "🇬🇧",
      },
      CAD: { symbol: "C$", name: "Canadian Dollar", country: "Canada", flag: "🇨🇦" },
      AUD: {
        symbol: "A$",
        name: "Australian Dollar",
        country: "Australia",
        flag: "🇦🇺",
      },
      SGD: {
        symbol: "S$",
        name: "Singapore Dollar",
        country: "Singapore",
        flag: "🇸🇬",
      },
      AED: { symbol: "د.إ", name: "UAE Dirham", country: "UAE", flag: "🇦🇪" },
      CHF: {
        symbol: "Fr",
        name: "Swiss Franc",
        country: "Switzerland",
        flag: "🇨🇭",
      },
      HKD: {
        symbol: "HK$",
        name: "Hong Kong Dollar",
        country: "Hong Kong",
        flag: "🇭🇰",
      },
      NZD: {
        symbol: "NZ$",
        name: "New Zealand Dollar",
        country: "New Zealand",
        flag: "🇳🇿",
      },
      JPY: { symbol: "¥", name: "Japanese Yen", country: "Japan", flag: "🇯🇵" },
      NOK: { symbol: "kr", name: "Norwegian Krone", country: "Norway", flag: "🇳🇴" },
      SEK: { symbol: "kr", name: "Swedish Krona", country: "Sweden", flag: "🇸🇪" },
      DKK: { symbol: "kr", name: "Danish Krone", country: "Denmark", flag: "🇩🇰" },
      MXN: { symbol: "$", name: "Mexican Peso", country: "Mexico", flag: "🇲🇽" },
      BRL: { symbol: "R$", name: "Brazilian Real", country: "Brazil", flag: "🇧🇷" },
      ZAR: {
        symbol: "R",
        name: "South African Rand",
        country: "South Africa",
        flag: "🇿🇦",
      },
      TRY: { symbol: "₺", name: "Turkish Lira", country: "Turkey", flag: "🇹🇷" },
      SAR: {
        symbol: "﷼",
        name: "Saudi Riyal",
        country: "Saudi Arabia",
        flag: "🇸🇦",
      },
      QAR: { symbol: "﷼", name: "Qatari Riyal", country: "Qatar", flag: "🇶🇦" },
      KWD: { symbol: "KD", name: "Kuwaiti Dinar", country: "Kuwait", flag: "🇰🇼" },
    };
    
    const TO_USD = {
      USD: 1,
      EUR: 1.085,
      GBP: 1.267,
      CAD: 0.738,
      AUD: 0.648,
      SGD: 0.743,
      AED: 0.272,
      CHF: 1.115,
      HKD: 0.128,
      NZD: 0.609,
      JPY: 0.0067,
      NOK: 0.094,
      SEK: 0.095,
      DKK: 0.145,
      MXN: 0.058,
      BRL: 0.201,
      ZAR: 0.054,
      TRY: 0.031,
      SAR: 0.267,
      QAR: 0.274,
      KWD: 3.25,
    };
    

    const PROVIDERS = [
          {
            id: "bank_wire",
            name: "Bank Wire",
            type: "traditional",
            weekend_supported: false,
            supports_same_day: false,
            supports_express: false,
            min_amount_usd: 100,
            max_amount_usd: null,
            corridor_sensitivity: "low",
            pros: ["Strong regulatory protection"],
            fee_model: { flat_fee_usd: 30, percent_fee: 0, fx_markup_percent: 0.018 },
            settlement: { estimated_hours: 72 },
            risk_profile: {
              taxable_event: false,
              volatility_risk: "low",
              regulatory_complexity: "low",
            },
          },
          {
            id: "wise",
            name: "Wise",
            type: "traditional",
            weekend_supported: true,
            supports_same_day: false,
            supports_express: true,
            min_amount_usd: 1,
            max_amount_usd: 100000,
            corridor_sensitivity: "medium",
            pros: ["Strong global coverage"],
            fee_model: {
              flat_fee_usd: 4.5,
              percent_fee: 0.0045,
              fx_markup_percent: 0.005,
            },
            settlement: { estimated_hours: 24 },
            risk_profile: {
              taxable_event: false,
              volatility_risk: "low",
              regulatory_complexity: "low",
            },
          },
          {
            id: "western_union",
            name: "Western Union",
            type: "traditional",
            weekend_supported: true,
            supports_same_day: true,
            supports_express: true,
            min_amount_usd: 1,
            max_amount_usd: 50000,
            corridor_sensitivity: "high",
            pros: ["Cash pickup available"],
            fee_model: {
              flat_fee_usd: 10,
              percent_fee: 0.012,
              fx_markup_percent: 0.025,
            },
            settlement: { estimated_hours: 2 },
            risk_profile: {
              taxable_event: false,
              volatility_risk: "low",
              regulatory_complexity: "low",
            },
          },
          {
            id: "paypal",
            name: "PayPal",
            type: "digital_wallet",
            weekend_supported: true,
            supports_same_day: true,
            supports_express: true,
            min_amount_usd: 1,
            max_amount_usd: 20000,
            corridor_sensitivity: "medium",
            pros: ["Integrated marketplace use"],
            fee_model: { flat_fee_usd: 4, percent_fee: 0.028, fx_markup_percent: 0.03 },
            settlement: { estimated_hours: 12 },
            risk_profile: {
              taxable_event: false,
              volatility_risk: "low",
              regulatory_complexity: "low",
            },
          },
          {
            id: "remitly",
            name: "Remitly",
            type: "remittance",
            weekend_supported: true,
            supports_same_day: true,
            supports_express: true,
            min_amount_usd: 1,
            max_amount_usd: 30000,
            corridor_sensitivity: "high",
            pros: ["Competitive FX promotions"],
            fee_model: {
              flat_fee_usd: 3.5,
              percent_fee: 0.005,
              fx_markup_percent: 0.007,
            },
            settlement: { estimated_hours: 3 },
            risk_profile: {
              taxable_event: false,
              volatility_risk: "low",
              regulatory_complexity: "low",
            },
          },
          {
            id: "usdc_eth",
            name: "USDC / Ethereum",
            type: "crypto",
            weekend_supported: true,
            supports_same_day: true,
            supports_express: true,
            min_amount_usd: 50,
            max_amount_usd: null,
            corridor_sensitivity: "medium",
            pros: ["24/7 availability"],
            fee_model: {
              onramp_percent_fee: 0.008,
              gas_fee_usd_live: 5.5,
              exchange_trading_fee_percent: 0.001,
              offramp_percent_fee: 0.004,
              fx_spread_percent: 0.002,
            },
            settlement: { estimated_hours: 0.5 },
            risk_profile: {
              taxable_event: true,
              volatility_risk: "medium",
              regulatory_complexity: "high",
            },
          },
        ];
        
        const DELIVERY_OPTIONS = [
          { val: "standard", label: "Standard", sub: "3-5 business days" },
          { val: "express", label: "Express", sub: "1-2 business days" },
          { val: "same_day", label: "Same-Day", sub: "Within hours" },
        ];
        
        const RISK_OPTIONS = [
          { val: "low", label: "Conservative", sub: "Regulated only" },
          { val: "medium", label: "Balanced", sub: "Optimised cost" },
          { val: "high", label: "Flexible", sub: "Includes crypto" },
        ];
        
        const PIE_COLORS = [
          "#1B4079",
          "#2E7D87",
          "#4D9EA8",
          "#CBDF90",
          "#E8A838",
          "#3D9970",
        ];

        function calcFee(provider, amountUSD) {
              if (provider.type === "crypto") {
                const m = provider.fee_model;
                return (
                  amountUSD * m.onramp_percent_fee +
                  m.gas_fee_usd_live +
                  amountUSD * m.exchange_trading_fee_percent +
                  amountUSD * m.offramp_percent_fee +
                  amountUSD * m.fx_spread_percent
                );
              }
              const m = provider.fee_model;
              return (
                m.flat_fee_usd + amountUSD * m.percent_fee + amountUSD * m.fx_markup_percent
              );
            }
            
            function formatTime(hours) {
              if (hours < 1) return `${Math.round(hours * 60)} min`;
              if (hours < 24) return `${hours}h`;
              return `${Math.round(hours / 24)} day${
                Math.round(hours / 24) > 1 ? "s" : ""
              }`;
            }
            
            function applySortKey(items, key) {
              return [...items].sort((a, b) => {
                if (key === "score") return b.score - a.score;
                if (key === "cost") return a.totalFee - b.totalFee;
                return a.settlementHours - b.settlementHours;
              });
            }
            

// ─── FlagSelect: flag shown ONLY as overlay span, NOT in option text ──────────
function FlagSelect({ label, value, onChange, entries }) {
      const currentFlag = entries.find(([k]) => k === value)?.[1]?.flag ?? "";
      return (
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: C.muted,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {label}
          </label>
          <div style={{ position: "relative" }}>
            {/* flag overlay — purely visual, not part of option text */}
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 17,
                pointerEvents: "none",
                zIndex: 1,
                lineHeight: 1,
              }}
            >
              {currentFlag}
            </span>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: "100%",
                appearance: "none",
                background: C.card,
                border: `1.5px solid ${C.border}`,
                borderRadius: 10,
                padding: "11px 40px 11px 40px",
                fontSize: 14,
                color: C.text,
                fontFamily: "inherit",
                cursor: "pointer",
                outline: "none",
                transition: "border-color .15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.teal)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            >
              {/* NO flag in option text — avoids double-flag */}
              {entries.map(([k, v]) => (
                <option key={k} value={k}>
                  {k} — {v.name}
                </option>
              ))}
            </select>
            <svg
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2 4l4 4 4-4"
                stroke={C.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      );
    }
    
    function OptionPills({ options, value, onChange }) {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${options.length},1fr)`,
            gap: 8,
          }}
        >
          {options.map((o) => {
            const active = value === o.val;
            return (
              <button
                key={o.val}
                onClick={() => onChange(o.val)}
                style={{
                  background: active ? C.primary : C.card,
                  border: `1.5px solid ${active ? C.primary : C.border}`,
                  borderRadius: 10,
                  padding: "10px 8px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all .15s",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: active ? "#fff" : C.text,
                  }}
                >
                  {o.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: active ? "rgba(255,255,255,.65)" : C.muted,
                    marginTop: 2,
                  }}
                >
                  {o.sub}
                </div>
              </button>
            );
          })}
        </div>
      );
    }
    
    function Chip({ children, color }) {
      return (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color,
            background: color + "18",
            border: `1px solid ${color}30`,
            borderRadius: 20,
            padding: "2px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {children}
        </span>
      );
    }
    
    function AIModal({
      recommendation,
      amount,
      originCurrency,
      destCurrency,
      onClose,
    }) {
      const [text, setText] = useState("");
      const [loading, setLoading] = useState(true);
    
      useEffect(() => {
        async function getAI() {
          try {
            const review = await generateAIReview({
              amount,
              originCurrency,
              destCurrency,
              recommendation,
            });
            setText(review);
          } catch (err) {
            console.error(err);
            setText("AI analysis unavailable.");
          } finally {
            setLoading(false);
          }
        }
    
        getAI();
      }, []);
    
      return (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,30,50,.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.card,
              borderRadius: 20,
              padding: 36,
              maxWidth: 460,
              width: "90%",
              boxShadow: "0 24px 60px rgba(0,0,0,.18)",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `linear-gradient(135deg,${C.teal},${C.primary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="#fff" strokeWidth="1.5" />
                  <path
                    d="M9 6v4m0 2.5v.5"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
                  AI Analysis
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  Route recommendation
                </div>
              </div>
            </div>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  color: C.muted,
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.teal,
                    animation: "pulse 1s infinite",
                  }}
                />
                Analysing transfer routes...
              </div>
            ) : (
              <p
                style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}
              >
                {text}
              </p>
            )}
            <button
              onClick={onClose}
              style={{
                marginTop: 24,
                background: C.bg,
                border: `1.5px solid ${C.border}`,
                color: C.muted,
                borderRadius: 10,
                padding: "9px 20px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    
    function BRow({ label, value, highlight, warn }) {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: C.bg,
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: warn ? C.warn : highlight ? C.error : C.text,
                }}
              >
                {value}
              </span>
            </div>
          );
        }
        
        // ─── sortBy → label shown on the highlighted card ────────────────────────────
        const HIGHLIGHT_LABEL = {
          score: "Best Match",
          cost: "Cheapest",
          time: "Fastest",
        };
        const HIGHLIGHT_COLOR = { score: C.teal, cost: C.success, time: C.primary };
        
        function ResultCard({
          item,
          isHighlighted,
          highlightLabel,
          highlightColor,
          pairData,
          amountUSD,
          onAsk,
        }) {
          const [open, setOpen] = useState(false);
          const isCrypto = item.provider.type === "crypto";
          const feeColor =
            item.costPct < 1 ? C.success : item.costPct < 2 ? C.warn : C.error;
        
          return (
            <div
              style={{
                background: C.card,
                borderRadius: 16,
                overflow: "hidden",
                border: `1.5px solid ${isHighlighted ? highlightColor : C.border}`,
                boxShadow: isHighlighted
                  ? `0 4px 24px ${highlightColor}22`
                  : "0 1px 4px rgba(0,0,0,.05)",
                transition: "box-shadow .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = isHighlighted
                  ? `0 4px 24px ${highlightColor}22`
                  : "0 1px 4px rgba(0,0,0,.05)")
              }
            >
              {isHighlighted && (
                <div
                  style={{
                    height: 3,
                    background: `linear-gradient(90deg,${highlightColor},${C.primary})`,
                  }}
                />
              )}
              <div style={{ padding: "20px 24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
                        {item.name}
                      </span>
        
                      {/* TYPE CHIP */}
                      <Chip
                        color={
                          item.provider.type === "crypto"
                            ? C.warn
                            : item.provider.type === "remittance"
                            ? C.success
                            : item.provider.type === "digital_wallet"
                            ? C.teal
                            : C.primary
                        }
                      >
                        {item.provider.type.replace("_", " ")}
                      </Chip>
        
                      {/* PRO CHIPS */}
                      {item.provider.pros.slice(0, 2).map((pro, idx) => (
                        <Chip key={idx} color={C.tealLight}>
                          {pro}
                        </Chip>
                      ))}
        
                      {/* TAX FLAG */}
                      {item.taxFlag && <Chip color={C.warn}>Tax event</Chip>}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        marginTop: 2,
                        textTransform: "capitalize",
                      }}
                    >
                      {item.provider.type.replace("_", " ")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: feeColor }}>
                      ${item.totalFee.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {item.costPct.toFixed(2)}% of send
                    </div>
                  </div>
                </div>
        
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  {[
                    {
                      label: "Recipient gets",
                      value: `${pairData.symbol}${item.received.toFixed(0)}`,
                    },
                    {
                      label: "Time to arrival",
                      value: formatTime(item.settlementHours),
                    },
                    { label: "FX markup", value: `${item.fxMarkup.toFixed(2)}%` },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: C.bg,
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: C.muted,
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        {s.label}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
        
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>Risk level:</span>
                  <Chip
                    color={
                      item.provider.risk_profile.volatility_risk === "low"
                        ? C.success
                        : item.provider.risk_profile.volatility_risk === "medium"
                        ? C.warn
                        : C.error
                    }
                  >
                    {item.provider.risk_profile.volatility_risk
                      .charAt(0)
                      .toUpperCase() +
                      item.provider.risk_profile.volatility_risk.slice(1)}
                  </Chip>
                </div>
        
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => setOpen(!open)}
                    style={{
                      flex: 1,
                      background: open ? C.primary : C.bg,
                      border: `1.5px solid ${open ? C.primary : C.border}`,
                      color: open ? "#fff" : C.text,
                      borderRadius: 10,
                      padding: "9px 0",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    {open ? "Hide breakdown" : "View breakdown"}
                  </button>
                  {isHighlighted && (
                    <button
                      onClick={onAsk}
                      style={{
                        background: `linear-gradient(135deg,${C.teal},${C.primary})`,
                        border: "none",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "9px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Ask AI
                    </button>
                  )}
                </div>
              </div>
        
              <div
                style={{
                  maxHeight: open ? 400 : 0,
                  overflow: "hidden",
                  transition: "max-height .35s cubic-bezier(.4,0,.2,1)",
                }}
              >
                <div
                  style={{
                    padding: "0 24px 24px",
                    borderTop: `1px solid ${C.border}`,
                    paddingTop: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.muted,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    Fee breakdown
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {isCrypto ? (
                      <>
                        <BRow
                          label="On-ramp fee"
                          value={`$${(
                            amountUSD * item.provider.fee_model.onramp_percent_fee
                          ).toFixed(2)}`}
                        />
                        <BRow
                          label="Network gas fee"
                          value={`$${item.provider.fee_model.gas_fee_usd_live.toFixed(
                            2
                          )}`}
                          highlight
                        />
                        <BRow
                          label="Exchange fee"
                          value={`$${(
                            amountUSD *
                            item.provider.fee_model.exchange_trading_fee_percent
                          ).toFixed(2)}`}
                        />
                        <BRow
                          label="Off-ramp fee"
                          value={`$${(
                            amountUSD * item.provider.fee_model.offramp_percent_fee
                          ).toFixed(2)}`}
                        />
                        <BRow
                          label="FX spread"
                          value={`$${(
                            amountUSD * item.provider.fee_model.fx_spread_percent
                          ).toFixed(2)}`}
                        />
                        <BRow
                          label="Tax implication"
                          value="Possible capital gains event"
                          warn
                        />
                      </>
                    ) : (
                      <>
                        {item.provider.fee_model.flat_fee_usd > 0 && (
                          <BRow
                            label="Flat fee"
                            value={`$${item.provider.fee_model.flat_fee_usd.toFixed(
                              2
                            )}`}
                          />
                        )}
                        {item.provider.fee_model.percent_fee > 0 && (
                          <BRow
                            label="Transfer fee"
                            value={`$${(
                              amountUSD * item.provider.fee_model.percent_fee
                            ).toFixed(2)} (${(
                              item.provider.fee_model.percent_fee * 100
                            ).toFixed(2)}%)`}
                          />
                        )}
                        <BRow
                          label="FX markup"
                          value={`$${(
                            amountUSD * item.provider.fee_model.fx_markup_percent
                          ).toFixed(2)} (${(
                            item.provider.fee_model.fx_markup_percent * 100
                          ).toFixed(2)}%)`}
                          highlight={item.provider.fee_model.fx_markup_percent > 0.02}
                        />
                        <BRow label="Tax implication" value="No taxable event" />
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: `1px dashed ${C.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>
                      Total fees
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: feeColor }}>
                      ${item.totalFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        

        function FeeDot(props) {
              const { cx, cy, index } = props;
              const color = PIE_COLORS[index % PIE_COLORS.length];
              return (
                <g key={`dot-${index}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={9}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={2.5}
                  />
                  <circle cx={cx} cy={cy} r={3.5} fill="#fff" />
                </g>
              );
            }
            
            function ChartsSection({ items, destData, destCurrency }) {
              const [pieProvider, setPieProvider] = useState(items[0]?.provider.id);
              const selectedItem =
                items.find((i) => i.provider.id === pieProvider) || items[0];
            
              const TooltipBox = ({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: "10px 14px",
                      boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                      fontFamily: "inherit",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.primary,
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </div>
                    {payload.map((p, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.muted }}>
                        {p.name}: <strong style={{ color: C.text }}>{p.value}</strong>
                      </div>
                    ))}
                  </div>
                );
              };
            
              const dotData = [...items]
                .sort((a, b) => a.totalFee - b.totalFee)
                .map((i) => ({
                  name: i.name.split(" ")[0],
                  fee: parseFloat(i.totalFee.toFixed(2)),
                }));
              const fxData = items.map((i) => ({
                name: i.name.split(" ")[0],
                fx: parseFloat(i.fxMarkup.toFixed(3)),
              }));
              const recvData = items.map((i) => ({
                name: i.name.split(" ")[0],
                recv: parseFloat(i.received.toFixed(0)),
              }));
            
              const pieData =
                selectedItem.provider.type === "crypto"
                  ? [
                      {
                        name: "On-ramp",
                        value: parseFloat(
                          (
                            selectedItem.amountUSD *
                            selectedItem.provider.fee_model.onramp_percent_fee
                          ).toFixed(2)
                        ),
                      },
                      {
                        name: "Gas fee",
                        value: selectedItem.provider.fee_model.gas_fee_usd_live,
                      },
                      {
                        name: "Exchange",
                        value: parseFloat(
                          (
                            selectedItem.amountUSD *
                            selectedItem.provider.fee_model.exchange_trading_fee_percent
                          ).toFixed(2)
                        ),
                      },
                      {
                        name: "Off-ramp",
                        value: parseFloat(
                          (
                            selectedItem.amountUSD *
                            selectedItem.provider.fee_model.offramp_percent_fee
                          ).toFixed(2)
                        ),
                      },
                      {
                        name: "FX spread",
                        value: parseFloat(
                          (
                            selectedItem.amountUSD *
                            selectedItem.provider.fee_model.fx_spread_percent
                          ).toFixed(2)
                        ),
                      },
                    ]
                  : [
                      selectedItem.provider.fee_model.flat_fee_usd > 0 && {
                        name: "Flat fee",
                        value: parseFloat(
                          selectedItem.provider.fee_model.flat_fee_usd.toFixed(2)
                        ),
                      },
                      selectedItem.provider.fee_model.percent_fee > 0 && {
                        name: "Pct fee",
                        value: parseFloat(
                          (
                            selectedItem.amountUSD *
                            selectedItem.provider.fee_model.percent_fee
                          ).toFixed(2)
                        ),
                      },
                      {
                        name: "FX markup",
                        value: parseFloat(
                          (
                            selectedItem.amountUSD *
                            selectedItem.provider.fee_model.fx_markup_percent
                          ).toFixed(2)
                        ),
                      },
                    ].filter(Boolean);
            
              const cardStyle = {
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "22px 24px",
                boxShadow: "0 2px 8px rgba(0,0,0,.04)",
              };
              const sLabel = {
                fontSize: 11,
                fontWeight: 700,
                color: C.teal,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 14,
              };
            
              return (
                <div style={{ marginTop: 32 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.text,
                      marginBottom: 16,
                    }}
                  >
                    Visual Analysis
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={cardStyle}>
                      <span style={sLabel}>Total Fee by Provider (USD)</span>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart
                          data={dotData}
                          margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={C.bgDeep}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: C.muted }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: C.subtle }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div
                                  style={{
                                    background: C.card,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                    boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                                    fontFamily: "inherit",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: C.primary,
                                      marginBottom: 4,
                                    }}
                                  >
                                    {payload[0].payload.name}
                                  </div>
                                  <div style={{ fontSize: 12, color: C.muted }}>
                                    Total Fee:{" "}
                                    <strong style={{ color: C.text }}>
                                      ${payload[0].value}
                                    </strong>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="fee"
                            stroke={C.border}
                            strokeWidth={1.5}
                            strokeDasharray="5 4"
                            dot={<FeeDot />}
                            activeDot={{
                              r: 11,
                              strokeWidth: 2.5,
                              stroke: "#fff",
                              fill: C.teal,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
            
                    <div style={cardStyle}>
                      <span style={sLabel}>FX Spread by Provider (%)</span>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={fxData} layout="vertical" barCategoryGap="32%">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={C.bgDeep}
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: C.subtle }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 11, fill: C.muted }}
                            axisLine={false}
                            tickLine={false}
                            width={80}
                          />
                          <Tooltip
                            content={<TooltipBox />}
                            cursor={{ fill: `${C.teal}08` }}
                          />
                          <Bar dataKey="fx" name="FX Spread" radius={[0, 6, 6, 0]}>
                            {fxData.map((d, i) => (
                              <Cell
                                key={i}
                                fill={d.fx < 0.5 ? "#3A8FB5" : d.fx < 1.5 ? "#2A6496" : "#1B4079"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
            
                    <div style={cardStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 14,
                        }}
                      >
                        <span style={{ ...sLabel, marginBottom: 0 }}>Fee Breakdown</span>
                        <select
                          value={pieProvider}
                          onChange={(e) => setPieProvider(e.target.value)}
                          style={{
                            background: C.bg,
                            border: `1px solid ${C.border}`,
                            color: C.teal,
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontFamily: "inherit",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                        >
                          {items.map((i) => (
                            <option key={i.provider.id} value={i.provider.id}>
                              {i.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            dataKey="value"
                            paddingAngle={3}
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => `$${v}`} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(val) => (
                              <span style={{ fontSize: 11, color: C.muted }}>{val}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
            
                    <div style={cardStyle}>
                      <span style={sLabel}>
                        Recipient Receives ({destCurrency}) by Provider
                      </span>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={recvData} barCategoryGap="28%">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={C.bgDeep}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: C.muted }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: C.subtle }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `${destData.symbol}${v.toLocaleString()}`}
                          />
                          <Tooltip
                            content={<TooltipBox />}
                            cursor={{ fill: `${C.teal}08` }}
                          />
                          <Bar
                            dataKey="recv"
                            name={`${destCurrency} received`}
                            radius={[6, 6, 0, 0]}
                          >
                            {recvData.map((_, i) => (
                              <Cell key={i} fill={i === 0 ? C.success : C.tealLight} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            }

// ─── Main component ───────────────────────────────────────────────────────────
export default function SmarTransfer() {
      const [amount, setAmount] = useState(5000);
      const [originCurrency, setOriginCurrency] = useState("USD");
      const [destCurrency, setDestCurrency] = useState("INR");
      const [delivery, setDelivery] = useState("standard");
      const [risk, setRisk] = useState("medium");
      const [sortBy, setSortBy] = useState("score");
      const [computedItems, setComputedItems] = useState(null);
      const [bestScoreId, setBestScoreId] = useState(null); // id of best-score provider
      const [cheapestId, setCheapestId] = useState(null); // id of cheapest provider
      const [fastestId, setFastestId] = useState(null); // id of fastest provider
      const [amountUSD, setAmountUSD] = useState(null);
      const [midRate, setMidRate] = useState(null);
      const [fxRate, setFxRate] = useState(null);
      const [fxLoading, setFxLoading] = useState(false);
      const [showAI, setShowAI] = useState(false);
      const [hasRun, setHasRun] = useState(false);
      const [activeTab, setActiveTab] = useState("results");
    
      const destData = DEST_CURRENCIES[destCurrency] || DEST_CURRENCIES.INR;
    
      // sorted list for display — order changes with sortBy
      const sortedItems = useMemo(
        () => (computedItems ? applySortKey(computedItems, sortBy) : null),
        [computedItems, sortBy]
      );
    
      // which provider id to highlight depends on active sort mode
      const highlightedId =
        sortBy === "score"
          ? bestScoreId
          : sortBy === "cost"
          ? cheapestId
          : fastestId;
      // highlighted item (to pass to AI modal)
      const highlightedItem =
        sortedItems?.find((i) => i.provider.id === highlightedId) ?? null;

    useEffect(() => {
        setFxLoading(true);
        fetch(
          `https://api.frankfurter.dev/v1/latest?base=USD&symbols=${destCurrency}`
        )
          .then((r) => r.json())
          .then((d) => {
            setFxRate(d.rates?.[destCurrency] || destData.baseRateFromUSD);
            setFxLoading(false);
          })
          .catch(() => {
            setFxRate(destData.baseRateFromUSD);
            setFxLoading(false);
          });
      }, [destCurrency]);

    function analyze() {
        const today = new Date();
        const isWeekend = today.getDay() === 0 || today.getDay() === 6;
        const usdConversion = TO_USD[originCurrency] || 1;
        const aUSD = amount * usdConversion;
        const rate = fxRate || destData.baseRateFromUSD;
         const eligibleProviders = PROVIDERS.filter((p) => {
              // Only restrict weekend for urgent modes
              if (isWeekend && delivery !== "standard" && !p.weekend_supported)
                return false;
        
              if (delivery === "same_day" && !p.supports_same_day) return false;
        
              if (delivery === "express" && !p.supports_express) return false;
        
              if (p.min_amount_usd && aUSD < p.min_amount_usd) return false;
        
              if (p.max_amount_usd && aUSD > p.max_amount_usd) return false;
        
              return true;
            });

          const computed = eligibleProviders.map((p) => {
                  const fee = calcFee(p, aUSD);
                  const effectiveRate =
                    p.type === "crypto"
                      ? rate * (1 - (p.fee_model.fx_spread_percent || 0))
                      : rate * (1 - (p.fee_model.fx_markup_percent || 0));
                  const received = (aUSD - fee) * effectiveRate;
                  const costPct = (fee / aUSD) * 100;
            
                  let score = 0;
            
                  // ─────────────────────────────
                  // STANDARD → absolute dollar priority
                  // ─────────────────────────────
                  if (delivery === "standard") {
                    score = 100 - fee / 20;
                  }
            
                  // ─────────────────────────────
                  // EXPRESS → balanced
                  // ─────────────────────────────
                  if (delivery === "express") {
                    const costComponent = 100 - fee / 25;
                    const speedComponent = 100 - p.settlement.estimated_hours * 3;
            
                    score = costComponent * 0.6 + speedComponent * 0.4;
                  }
            
                  // ─────────────────────────────
                  // SAME DAY → speed dominates
                  // ─────────────────────────────
                  if (delivery === "same_day") {
                    const speedComponent = 100 - p.settlement.estimated_hours * 6;
                    const costComponent = 100 - fee / 40;
            
                    score = speedComponent * 0.7 + costComponent * 0.3;
                  }
            
                  // ─────────────────────────────
                  // Risk adjustments
                  // ─────────────────────────────
                  if (risk === "low" && p.type === "crypto") score -= 40;
                  if (risk === "medium" && p.type === "crypto") score -= 15;
                  if (risk === "high" && p.type === "crypto") score += 10;
            
                  // Prevent negative scores
                  score = Math.max(score, 0);
            
                  return {
                    provider: p,
                    name: p.name,
                    totalFee: fee,
                    effectiveRate,
                    received,
                    costPct,
                    settlementHours: p.settlement.estimated_hours,
                    score,
                    taxFlag: p.risk_profile.taxable_event,
                    fxMarkup:
                      p.type === "crypto"
                        ? (p.fee_model.fx_spread_percent || 0) * 100
                        : (p.fee_model.fx_markup_percent || 0) * 100,
                    amountUSD: aUSD,
                  };
                });
            
                // pre-compute the "winner" for each category
                const byScore = [...computed].sort((a, b) => b.score - a.score);
                const byCost = [...computed].sort((a, b) => a.totalFee - b.totalFee);
                const bySpeed = [...computed].sort(
                  (a, b) => a.settlementHours - b.settlementHours
                );
            
                setComputedItems(computed);
                setBestScoreId(byScore[0].provider.id);
                setCheapestId(byCost[0].provider.id);
                setFastestId(bySpeed[0].provider.id);
                setAmountUSD(aUSD);
                setMidRate(rate);
                setHasRun(true);
                setSortBy("score");
                setActiveTab("results");
              }
            
              const originData = CURRENCIES[originCurrency];
  return (
    <div style={{ minHeight:"100vh", width:"100%", background:`linear-gradient(160deg,#DFF0FA 0%,#EEF5FB 35%,#E3EEF7 70%,#D8EEFF 100%)`, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        html, body, #root { width:100%; min-height:100vh; }
        ::selection { background:${C.teal}; color:#fff; }        
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        input:focus, select:focus { outline:none; }
        input[type=range] { -webkit-appearance:none; height:3px; background:${C.border}; border-radius:2px; width:100%; }
         input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:${C.teal}; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,.2); }
              `}</style>

 {/* Nav */}
      <nav
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "0 20px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={`data:image/jpeg;base64,${LOGO_B64}`}
            alt="SmartTransfer"
            style={{
              height: 95,
              objectFit: "contain",
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {fxLoading ? (
            <span style={{ fontSize: 12, color: C.subtle }}>
              Loading rates...
            </span>
          ) : (
            fxRate && (
              <span
                style={{
                  fontSize: 12,
                  color: C.teal,
                  background: `${C.teal}12`,
                  border: `1px solid ${C.teal}25`,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontWeight: 600,
                }}
              >
                {CURRENCIES[originCurrency]?.flag} 1 {originCurrency} ={" "}
                {(fxRate * (TO_USD[originCurrency] || 1)).toFixed(4)}{" "}
                {destCurrency} {destData.flag}
              </span>
            )
          )}
        </div>
      </nav>

        {/* Hero */}
      <div
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "88px 40px 72px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: C.text,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            maxWidth: 580,
            margin: "0 auto 16px",
          }}
        >
          Find the smartest way
          <br />
          to send money abroad.
        </h1>
        <p
          style={{
            fontSize: 16,
            color: C.muted,
            maxWidth: 460,
            margin: "0 auto",
            lineHeight: 1.65,
          }}
        >
          Compare banks, remittance apps, and crypto routes in real time with
          full fee transparency and AI-powered recommendations.
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "40px 40px",
        }}
      >
       

       {/* Form */}
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            borderRadius: 20,
            border: `1px solid ${C.border}`,
            padding: 32,
            marginBottom: 28,
            boxShadow: "0 2px 16px rgba(27,64,121,.06)",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.text,
              marginBottom: 24,
            }}
          >
            Transfer details
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 1fr",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <FlagSelect
              label="Origin currency"
              value={originCurrency}
              onChange={setOriginCurrency}
              entries={Object.entries(CURRENCIES)}
            />

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.muted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Amount
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "0 14px",
                  background: C.card,
                  transition: "border-color .15s",
                }}
                onFocusCapture={(e) =>
                  (e.currentTarget.style.borderColor = C.teal)
                }
                onBlurCapture={(e) =>
                  (e.currentTarget.style.borderColor = C.border)
                }
              >
                <span style={{ fontSize: 18, color: C.muted, fontWeight: 700 }}>
                  {originData?.symbol || "$"}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(Math.max(1, Number(e.target.value)))
                  }
                  style={{
                    border: "none",
                    background: "none",
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.text,
                    width: "100%",
                    padding: "11px 0",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ marginTop: 8 }}
              />
            </div>

            <FlagSelect
              label="Destination currency"
              value={destCurrency}
              onChange={setDestCurrency}
              entries={Object.entries(DEST_CURRENCIES)}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.muted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Time to arrival
              </div>
              <OptionPills
                options={DELIVERY_OPTIONS}
                value={delivery}
                onChange={setDelivery}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.muted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Risk tolerance
              </div>
              <OptionPills
                options={RISK_OPTIONS}
                value={risk}
                onChange={setRisk}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <button
              onClick={analyze}
              style={{
                background: `linear-gradient(135deg,${C.teal},${C.primary})`,
                border: "none",
                borderRadius: 12,
                padding: "14px 36px",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 4px 20px ${C.teal}40`,
                transition: "transform .15s, box-shadow .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 8px 28px ${C.teal}55`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = `0 4px 20px ${C.teal}40`;
              }}
            >
              Compare routes
            </button>
            <span style={{ fontSize: 12, color: C.subtle }}>
              Rates via Frankfurter API · Updated live
            </span>
          </div>
        </div>

               {/* Results */}
        {sortedItems && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            {/* Summary banner — always shows top-of-current-sort winner */}
            <div
              style={{
                background: `linear-gradient(135deg,${C.primary},${C.teal})`,
                borderRadius: 20,
                padding: "28px 32px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 180 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.6)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {sortBy === "score"
                    ? "Best Match"
                    : sortBy === "cost"
                    ? "Cheapest Option"
                    : "Fastest Route"}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {highlightedItem?.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,.65)",
                    marginTop: 4,
                  }}
                >
                  Saves $
                  {(
                    sortedItems.reduce((a, b) =>
                      a.totalFee > b.totalFee ? a : b
                    ).totalFee - (highlightedItem?.totalFee ?? 0)
                  ).toFixed(2)}{" "}
                  vs most expensive
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  {
                    label: "Total fee",
                    value: `$${highlightedItem?.totalFee.toFixed(2)}`,
                  },
                  {
                    label: "Recipient receives",
                    value: `${
                      destData.symbol
                    }${highlightedItem?.received.toFixed(0)}`,
                  },
                  {
                    label: "Time to arrival",
                    value: formatTime(highlightedItem?.settlementHours ?? 0),
                  },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,.55)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 4,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}
                    >
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab toggle */}
            <div
              style={{
                display: "flex",
                gap: 0,
                marginBottom: 24,
                background: C.card,
                borderRadius: 12,
                border: `1.5px solid ${C.border}`,
                padding: 4,
                width: "fit-content",
              }}
            >
              {[
                { val: "results", label: "Transfer Options" },
                { val: "charts", label: "Visual Analysis" },
              ].map((tab) => {
                const active = activeTab === tab.val;
                return (
                  <button
                    key={tab.val}
                    onClick={() => setActiveTab(tab.val)}
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#fff" : C.muted,
                      border: "none",
                      borderRadius: 9,
                      padding: "9px 24px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ── Transfer Options ── */}
            {activeTab === "results" && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 12, color: C.muted }}>
                    Mid-market rate:{" "}
                    <strong>
                      1 {originCurrency} ={" "}
                      {(midRate * (TO_USD[originCurrency] || 1)).toFixed(4)}{" "}
                      {destCurrency}
                    </strong>
                  </div>
                  {/* Sort buttons — highlight active, reorder list AND update highlighted card */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        alignSelf: "center",
                        marginRight: 4,
                      }}
                    >
                      Sort by
                    </span>
                    {[
                      ["score", "Best match"],
                      ["cost", "Cheapest"],
                      ["time", "Fastest"],
                    ].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setSortBy(val)}
                        style={{
                          background: sortBy === val ? C.primary : C.card,
                          border: `1.5px solid ${
                            sortBy === val ? C.primary : C.border
                          }`,
                          color: sortBy === val ? "#fff" : C.muted,
                          borderRadius: 8,
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all .15s",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {sortedItems.map((item) => (
                    <ResultCard
                      key={item.provider.id}
                      item={item}
                      isHighlighted={item.provider.id === highlightedId}
                      highlightLabel={HIGHLIGHT_LABEL[sortBy]}
                      highlightColor={
                        sortBy === "score"
                          ? C.teal
                          : sortBy === "cost"
                          ? C.success
                          : C.primary
                      }
                      pairData={destData}
                      amountUSD={amountUSD}
                      onAsk={() => setShowAI(true)}
                    />
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 12,
                    marginTop: 28,
                  }}
                >
                  {[
                    {
                      label: "Cheapest option",
                      value: `$${[...sortedItems]
                        .sort((a, b) => a.totalFee - b.totalFee)[0]
                        .totalFee.toFixed(2)}`,
                      sub: [...sortedItems].sort(
                        (a, b) => a.totalFee - b.totalFee
                      )[0].name,
                    },
                    {
                      label: "Most expensive",
                      value: `$${[...sortedItems]
                        .sort((a, b) => b.totalFee - a.totalFee)[0]
                        .totalFee.toFixed(2)}`,
                      sub: [...sortedItems].sort(
                        (a, b) => b.totalFee - a.totalFee
                      )[0].name,
                    },
                    {
                      label: "Maximum saving",
                      value: `$${(
                        [...sortedItems].sort(
                          (a, b) => b.totalFee - a.totalFee
                        )[0].totalFee -
                        [...sortedItems].sort(
                          (a, b) => a.totalFee - b.totalFee
                        )[0].totalFee
                      ).toFixed(2)}`,
                      sub: "by choosing best option",
                    },
                    {
                      label: "Fastest route",
                      value: formatTime(
                        Math.min(...sortedItems.map((i) => i.settlementHours))
                      ),
                      sub: [...sortedItems].sort(
                        (a, b) => a.settlementHours - b.settlementHours
                      )[0].name,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        padding: 20,
                        textAlign: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: C.subtle,
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: C.primary,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{ fontSize: 11, color: C.muted, marginTop: 4 }}
                      >
                        {s.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Visual Analysis ── */}
            {activeTab === "charts" && (
              <ChartsSection
                items={sortedItems}
                destData={destData}
                destCurrency={destCurrency}
              />
            )}
          </div>
        )}

        {!hasRun && (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: C.subtle,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `${C.teal}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12h18M12 3l9 9-9 9"
                  stroke={C.teal}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: C.muted,
                marginBottom: 6,
              }}
            >
              Ready to compare
            </div>
            <div style={{ fontSize: 13 }}>
              Enter your transfer details above and click "Compare routes"
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          width: "100%",
          borderTop: `1px solid ${C.border}`,
          padding: "20px 40px",
          display: "flex",
          gap: 24,
          fontSize: 11,
          color: C.subtle,
          flexWrap: "wrap",
          background: "rgba(255,255,255,0.6)",
        }}
      >
        <span>FX data: Frankfurter API</span>
        <span>·</span>
        <span>Crypto estimates: CoinGecko + Etherscan</span>
        <span>·</span>
        <span>For comparison purposes only; not financial advice</span>
      </div>

      {showAI && highlightedItem && (
        <AIModal
          recommendation={highlightedItem}
          amount={amount}
          originCurrency={originCurrency}
          destCurrency={destCurrency}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}