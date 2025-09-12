# MCP Server Practical Examples

This document provides real-world examples and use cases for the E-commerce MCP Server with multi-provider AI integration.

## Table of Contents

1. [Daily Operations Examples](#daily-operations-examples)
2. [Business Intelligence Scenarios](#business-intelligence-scenarios)
3. [Customer Support Use Cases](#customer-support-use-cases)
4. [Marketing & Sales Examples](#marketing--sales-examples)
5. [Technical Analysis Examples](#technical-analysis-examples)
6. [Comparative AI Analysis](#comparative-ai-analysis)

## Daily Operations Examples

### Morning Business Review

**Scenario:** E-commerce manager starts their day with AI-powered insights.

```json
// Step 1: Check system health
{
  "tool": "health_check",
  "args": {}
}

// Step 2: Get overnight analytics
{
  "tool": "get_analytics",
  "args": {
    "type": "overview"
  }
}

// Step 3: AI analysis of overnight performance
{
  "tool": "ai_business_insights",
  "args": {
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229"
  }
}
```

**Expected AI Response:**
```
📊 OVERNIGHT BUSINESS SUMMARY:

🎯 KEY HIGHLIGHTS:
- 47 new orders (+12% vs yesterday)
- $3,247 revenue (+8% vs yesterday)
- 23 abandoned carts worth $1,890

⚠️ ATTENTION NEEDED:
- Mobile conversion rate dropped to 1.8% (usually 2.3%)
- "Premium Headphones" inventory low (3 units left)
- 5 customer support tickets pending

🚀 OPPORTUNITIES:
- Cart recovery campaign could recover ~$945
- Mobile checkout optimization needed
- Restock popular items before weekend
```

### Product Performance Deep Dive

**Scenario:** Analyzing why certain products aren't selling well.

```json
// Get specific product data
{
  "tool": "get_product",
  "args": {
    "id": "product_struggling_123"
  }
}

// AI analysis with multiple providers for different perspectives
{
  "tool": "ai_analyze_products",
  "args": {
    "productId": "product_struggling_123",
    "provider": "openai",
    "model": "gpt-4"
  }
}
```

**ChatGPT Response Example:**
```
🔍 PRODUCT ANALYSIS: "Wireless Gaming Mouse"

📉 PERFORMANCE ISSUES:
- Only 3 cart additions in 30 days
- 0.5% conversion rate (category average: 2.1%)
- High bounce rate on product page (78%)

🎯 ROOT CAUSE ANALYSIS:
1. PRICING: $89 vs competitors at $65-75
2. IMAGES: Only 2 product photos, competitors have 5-8
3. REVIEWS: No customer reviews yet
4. DESCRIPTION: Technical specs only, missing benefit-focused copy

💡 OPTIMIZATION STRATEGY:
1. IMMEDIATE (This Week):
   - Add lifestyle images showing gaming setup
   - Rewrite description focusing on gaming performance benefits
   - Consider limited-time 15% discount to generate initial sales

2. SHORT-TERM (2-4 Weeks):
   - Reach out to gaming influencers for reviews
   - Create comparison chart vs competitors
   - Add video demonstration

3. LONG-TERM (1-3 Months):
   - Gather customer feedback and iterate
   - Consider product bundling with gaming accessories
   - Optimize for gaming-related search terms

📊 PROJECTED IMPACT:
- Price adjustment: +40% conversion rate
- Better images: +25% time on page
- Reviews: +60% purchase confidence
```

## Business Intelligence Scenarios

### Seasonal Trend Analysis

**Scenario:** Planning for upcoming holiday season.

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Based on our current product mix and performance, how should we prepare for the holiday shopping season? What inventory and marketing strategies would be most effective?",
    "provider": "perplexity",
    "model": "llama-3.1-sonar-large-128k-online",
    "context": {
      "current_month": "October",
      "top_categories": ["electronics", "accessories", "home"],
      "avg_order_value": 156,
      "conversion_rate": 2.3
    }
  }
}
```

**Perplexity Response Example:**
```
🎄 HOLIDAY SEASON PREPARATION STRATEGY

📈 MARKET TRENDS 2024:
- E-commerce holiday sales expected to grow 8.5% YoY
- Mobile shopping will account for 55% of online purchases
- Early shopping trend: 40% start before November
- Gift card sales peak 2 weeks before holidays

🛍️ INVENTORY RECOMMENDATIONS:
Based on your electronics/accessories focus:

HIGH-PRIORITY STOCK:
- Wireless headphones/earbuds (300% demand spike)
- Gaming accessories (250% increase)
- Smart home devices (200% growth)
- Phone accessories (180% boost)

TIMING:
- Order by Nov 1st for Black Friday
- Safety stock: 4-6 weeks of average sales
- Focus on $50-200 price range (sweet spot for gifts)

📱 MARKETING STRATEGY:
1. EARLY BIRD (Oct 15-Nov 15):
   - "Early Holiday Deals" campaign
   - Email list building with gift guides
   - Social media gift inspiration content

2. BLACK FRIDAY/CYBER MONDAY:
   - 20-30% discounts on electronics
   - Bundle deals for accessories
   - Limited-time flash sales

3. LAST-MINUTE (Dec 15-23):
   - Express shipping promotions
   - Digital gift cards
   - "Ships Today" product filters

💰 REVENUE PROJECTIONS:
- Expected 3-4x normal daily sales during peak
- AOV typically increases 25-40% in December
- Mobile optimization could boost conversions by 35%

🎯 ACTION ITEMS:
1. Audit current inventory levels
2. Set up holiday-themed product bundles
3. Optimize mobile checkout flow
4. Create gift guide landing pages
5. Plan email marketing calendar
```

### Competitive Analysis

**Scenario:** Understanding market position and opportunities.

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Our main competitors are selling similar electronics at 10-15% lower prices. How should we differentiate and compete without just cutting prices?",
    "provider": "anthropic",
    "model": "claude-3-opus-20240229",
    "context": {
      "our_avg_price": 145,
      "competitor_avg_price": 125,
      "our_conversion_rate": 2.3,
      "our_return_rate": 3.2
    }
  }
}
```

## Customer Support Use Cases

### Intelligent Customer Query Resolution

**Scenario:** Customer support agent needs help with complex product questions.

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Customer bought wireless headphones 3 weeks ago, now complaining about battery life only lasting 4 hours instead of advertised 8 hours. They want a refund. How should I handle this?",
    "provider": "anthropic",
    "model": "claude-3-haiku-20240307",
    "context": {
      "product": "Premium Wireless Headphones",
      "purchase_date": "2024-11-15",
      "advertised_battery": "8 hours",
      "actual_battery": "4 hours",
      "customer_tier": "premium",
      "return_policy": "30 days"
    }
  }
}
```

**Claude Response:**
```
🎧 CUSTOMER SUPPORT RESOLUTION GUIDE

✅ IMMEDIATE RESPONSE:
"I understand your frustration with the battery performance. Let me help resolve this right away."

🔍 TROUBLESHOOTING FIRST:
1. Ask about usage patterns:
   - Volume level (high volume drains faster)
   - Features used (noise cancellation, EQ settings)
   - Charging habits (partial vs full charges)

2. Quick fixes to try:
   - Full battery reset (drain completely, then full charge)
   - Disable unnecessary features
   - Check for firmware updates

📋 RESOLUTION OPTIONS:

OPTION 1 - REPLACEMENT (RECOMMENDED):
- Within 30-day return window
- Battery issue likely manufacturing defect
- Offer immediate replacement with expedited shipping
- "We'll send a replacement today, return the current pair when convenient"

OPTION 2 - TROUBLESHOOTING SUPPORT:
- If customer prefers to keep current pair
- Provide detailed optimization guide
- Follow up in 1 week to check improvement

OPTION 3 - REFUND:
- Last resort if replacement not acceptable
- Full refund within return policy
- Ask for feedback to improve product quality

💡 CUSTOMER RETENTION:
- Apologize for the inconvenience
- Offer 10% discount on next purchase
- Add to VIP support list for priority service

📝 FOLLOW-UP:
- Email with battery optimization tips
- Check satisfaction after resolution
- Flag product for quality review
```

### Return Policy Clarification

**Scenario:** Complex return situation requiring policy interpretation.

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Customer wants to return a $300 gaming keyboard after 45 days. Our policy is 30 days, but they claim they were traveling and couldn't test it. They're a repeat customer with $2000+ lifetime value. What's the best approach?",
    "provider": "openai",
    "model": "gpt-4",
    "context": {
      "product_value": 300,
      "days_since_purchase": 45,
      "policy_limit": 30,
      "customer_ltv": 2000,
      "customer_status": "repeat_customer"
    }
  }
}
```

## Marketing & Sales Examples

### Campaign Performance Analysis

**Scenario:** Analyzing the effectiveness of recent marketing campaigns.

```json
{
  "tool": "get_analytics",
  "args": {
    "type": "products",
    "startDate": "2024-11-01",
    "endDate": "2024-11-30"
  }
}

// Follow up with AI analysis
{
  "tool": "ai_chat",
  "args": {
    "query": "Analyze our November campaign performance and suggest improvements for December",
    "provider": "openai",
    "model": "gpt-4-turbo",
    "context": "{{analytics_result_from_previous_call}}"
  }
}
```

### Personalized Email Campaign Creation

**Scenario:** Creating targeted email campaigns based on customer behavior.

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Create email campaign ideas for customers who abandoned carts with electronics worth $200+. Include subject lines, content structure, and timing recommendations.",
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229",
    "context": {
      "abandoned_cart_value": 200,
      "product_category": "electronics",
      "customer_segment": "high_value_prospects"
    }
  }
}
```

**Claude Response:**
```
📧 HIGH-VALUE CART ABANDONMENT CAMPAIGN

🎯 CAMPAIGN STRATEGY:
3-email sequence over 7 days targeting $200+ electronics cart abandoners

EMAIL 1 - IMMEDIATE (1 hour after abandonment):
📬 Subject: "Your premium electronics are waiting"
📝 Content:
- Personalized product reminder with images
- "Still thinking it over?" approach
- Social proof (reviews, ratings)
- Free shipping reminder if applicable
- Clear CTA: "Complete Your Purchase"

EMAIL 2 - INCENTIVE (24 hours later):
📬 Subject: "Save 10% on your electronics - Limited time"
📝 Content:
- Exclusive discount code
- Urgency: "24-hour offer"
- Product benefits focus
- Customer testimonials
- Alternative product suggestions

EMAIL 3 - FINAL PUSH (5 days later):
📬 Subject: "Last chance - Your cart expires soon"
📝 Content:
- Scarcity: "Limited stock remaining"
- FOMO: "Don't miss out"
- Payment plan options for high-value items
- Customer service contact for questions
- Final CTA with urgency

⏰ TIMING OPTIMIZATION:
- Send during peak engagement hours (10 AM, 2 PM, 7 PM)
- Avoid weekends for B2B electronics
- Test Tuesday-Thursday for best response

📊 EXPECTED RESULTS:
- 15-25% recovery rate for high-value carts
- Higher engagement with personalized content
- Improved brand perception through helpful approach
```

## Technical Analysis Examples

### Website Performance Impact Analysis

**Scenario:** Correlating website performance with sales metrics.

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Our website load time increased from 2.1s to 3.4s last week, and conversion rate dropped from 2.3% to 1.9%. What's the likely impact and how should we prioritize fixes?",
    "provider": "google",
    "model": "gemini-pro",
    "context": {
      "previous_load_time": 2.1,
      "current_load_time": 3.4,
      "previous_conversion": 2.3,
      "current_conversion": 1.9,
      "weekly_traffic": 15000
    }
  }
}
```

### Database Performance Analysis

**Scenario:** Understanding database query performance impact on user experience.

```json
{
  "tool": "get_metrics",
  "args": {
    "format": "json"
  }
}

// Analyze the metrics with AI
{
  "tool": "ai_chat",
  "args": {
    "query": "Analyze these database performance metrics and suggest optimization priorities",
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229",
    "context": "{{metrics_from_previous_call}}"
  }
}
```

## Comparative AI Analysis

### Multi-Provider Product Strategy Analysis

**Scenario:** Getting different perspectives on the same business question.

**Question:** "Should we expand into smart home products based on our current electronics success?"

```json
// ChatGPT - Creative and comprehensive analysis
{
  "tool": "ai_chat",
  "args": {
    "query": "Should we expand into smart home products based on our current electronics success?",
    "provider": "openai",
    "model": "gpt-4",
    "context": {
      "current_categories": ["headphones", "gaming_accessories", "phone_accessories"],
      "monthly_revenue": 45000,
      "avg_order_value": 156
    }
  }
}

// Claude - Analytical and structured approach
{
  "tool": "ai_chat",
  "args": {
    "query": "Should we expand into smart home products based on our current electronics success?",
    "provider": "anthropic",
    "model": "claude-3-opus-20240229",
    "context": {
      "current_categories": ["headphones", "gaming_accessories", "phone_accessories"],
      "monthly_revenue": 45000,
      "avg_order_value": 156
    }
  }
}

// Perplexity - Market research and current trends
{
  "tool": "ai_chat",
  "args": {
    "query": "Should we expand into smart home products based on our current electronics success?",
    "provider": "perplexity",
    "model": "llama-3.1-sonar-large-128k-online",
    "context": {
      "current_categories": ["headphones", "gaming_accessories", "phone_accessories"],
      "monthly_revenue": 45000,
      "avg_order_value": 156
    }
  }
}

// Ollama - Local analysis for sensitive business data
{
  "tool": "ai_chat",
  "args": {
    "query": "Should we expand into smart home products based on our current electronics success?",
    "provider": "ollama",
    "model": "llama3",
    "context": {
      "current_categories": ["headphones", "gaming_accessories", "phone_accessories"],
      "monthly_revenue": 45000,
      "avg_order_value": 156
    }
  }
}
```

**Comparison Summary:**

| Provider | Strength | Response Style | Best For |
|----------|----------|----------------|----------|
| **ChatGPT** | Creative insights, comprehensive analysis | Detailed, well-structured | Strategic planning, creative solutions |
| **Claude** | Analytical depth, risk assessment | Methodical, cautious | Risk analysis, detailed planning |
| **Perplexity** | Current market data, trends | Research-backed, factual | Market research, competitive analysis |
| **Ollama** | Privacy, cost-effective | Direct, practical | Sensitive data, frequent queries |

### A/B Testing Analysis

**Scenario:** Analyzing A/B test results with different AI perspectives.

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Analyze these A/B test results and recommend next steps",
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229",
    "context": {
      "test_name": "Product page redesign",
      "variant_a": {
        "conversion_rate": 2.1,
        "bounce_rate": 45,
        "time_on_page": 120
      },
      "variant_b": {
        "conversion_rate": 2.8,
        "bounce_rate": 38,
        "time_on_page": 180
      },
      "sample_size": 5000,
      "confidence_level": 95
    }
  }
}
```

## Integration Examples

### Webhook Integration for Real-time Analysis

**Scenario:** Setting up automated AI analysis when certain events occur.

```json
// Example webhook payload for cart abandonment
{
  "tool": "ai_analyze_cart_abandonment",
  "args": {
    "provider": "anthropic",
    "model": "claude-3-haiku-20240307"
  }
}

// Automated response for high-value cart abandonment
{
  "tool": "ai_chat",
  "args": {
    "query": "A customer just abandoned a $500 cart with premium electronics. What immediate actions should we take?",
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "context": {
      "cart_value": 500,
      "products": ["premium_headphones", "wireless_charger"],
      "customer_history": "first_time_visitor"
    }
  }
}
```

### Scheduled Analysis Reports

**Scenario:** Daily/weekly automated business intelligence reports.

```bash
# Cron job example for daily AI insights
# 0 9 * * * /path/to/daily-ai-report.sh

#!/bin/bash
# daily-ai-report.sh

# Get yesterday's analytics
curl -X POST http://localhost:9090/mcp-call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "ai_business_insights",
    "args": {
      "provider": "anthropic",
      "model": "claude-3-sonnet-20240229"
    }
  }' | mail -s "Daily AI Business Report" manager@company.com
```

## Best Practices from Examples

### 1. Provider Selection Guidelines

- **OpenAI/ChatGPT**: Creative strategies, comprehensive analysis, customer-facing content
- **Anthropic/Claude**: Risk assessment, detailed analysis, policy interpretation
- **Google/Gemini**: Cost-effective analysis, quick insights, high-volume queries
- **Perplexity**: Market research, competitive analysis, trend identification
- **Ollama**: Sensitive data analysis, frequent queries, cost optimization

### 2. Context Optimization

Always provide relevant context:
```json
{
  "context": {
    "business_metrics": "current_performance_data",
    "time_period": "specific_timeframe",
    "customer_segment": "target_audience",
    "constraints": "budget_or_resource_limits"
  }
}
```

### 3. Query Structuring

Structure queries for better AI responses:
- Start with specific business context
- Include relevant metrics and data
- Ask for actionable recommendations
- Specify desired output format

### 4. Multi-Provider Workflows

Use different providers in sequence:
1. **Perplexity** for market research
2. **Claude** for risk analysis
3. **ChatGPT** for creative solutions
4. **Ollama** for implementation details

This comprehensive approach ensures you get the best insights from each AI provider's strengths.