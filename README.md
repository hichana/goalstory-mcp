# GoalMochi MCP Server (formerly Goal Story)

> **Note:** Goal Story has been rebranded to **GoalMochi**.  
> The product philosophy remains the same, but the MCP server architecture has changed (details below).

***GoalMochi is an HTTP MCP server now, so all you need to do is add `https://mcp.goalmochi.com/mcp` to a client and follow the steps -- you'll be good to go!!!**

GoalMochi isn’t a goal tracker—it’s a brand new way to manage your aspirations. Instead of juggling endless lists, GoalMochi guides you to focus on one goal at a time, forging a deeply personal narrative that keeps you motivated and on track. Powered by conversational AI, GoalMochi provides constructive insights and creative storytelling tailored to your unique motivations, helping you see your goal through to completion with a sense of momentum and fun.

Goal Mochi works because it weaves proven visualization techniques into your planning process. Research shows that using mental imagery when forming implementation intentions leads to higher rates of goal achievement.¹ By collaborating with an AI “thought partner,” you’ll generate personally meaningful stories that tap into your intrinsic motivators, priming both your mind and emotions to move forward. It’s not about ticking boxes—it’s about intuitive goal management that meets you where you are and adapts with you.

At the heart of this approach lies GoalMochi’s **GoalMochi Agent**, which transforms the typical, often dull process of goal tracking into an engaging, fun, and deeply resonant experience. With every completed goal, your insights and progress are securely captured, so you can reflect and build on them in the future. You don’t have to abandon your usual tools—track your tasks wherever you like. GoalMochi simply turns goal-tracking into a dynamic story that evolves, energizes, and empowers you to achieve what matters most.

Getting started is EASY!
1. Email `story@GoalMochi.com` with some details about you and the goal you want to achieve
2. Log into [GoalMochi.com](https://www.goalmochi.com/) with the same email address (or with a Google account connected to your email) to schedule a daily goal summary to be emailed to you
3. Email `story@GoalMochi.com` at any time to request a new story about your goal or give feedback, tell GoalMochi you've completed your goal and want to work on a new one, and so on.

Stories from GoalMochi and daily summaries include AI deep research, so you're both inspired and informed!

¹ See abstract on [Research Gate](https://www.researchgate.net/publication/225722903_Using_Mental_Imagery_to_Enhance_the_Effectiveness_of_Implementation_Intentions)









---

**The following is legacy (deprectated) info about the previous Goal Story MCP package which was distributed as an NPM package**

## Important Architecture Update

The GoalMochi MCP server **is no longer distributed or run as an NPM package**.

### What changed?

- ❌ **No more NPM-based MCP server**
- ✅ **Now an HTTP-based MCP server**
- ✅ **Accessed via a simple URL**
- ✅ **Uses OAuth for authentication** (for example, signing in with your Google account)

This means you **do not install or run GoalMochi locally**. Instead, your MCP client connects directly to the hosted GoalMochi MCP server over HTTPS.

---

## Authentication (OAuth)

GoalMochi uses OAuth for secure access. When connecting from an MCP-compatible client, you’ll be prompted to authenticate using an OAuth provider such as **Google**. This replaces the old API-key-only workflow and allows for:

- Secure identity-based access
- Easier onboarding
- Account-level goal history and continuity

---

## MCP Server Configuration

Because GoalMochi is now an HTTP MCP server, configuration is much simpler. You only need to provide the server URL in your MCP client configuration.

Example:

```json
{
  "goalMochi": {
    "url": "https://api.goalmochi.ai/mcp"
  }
}




