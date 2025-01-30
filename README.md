# Goal Story MCP Server

[![smithery badge](https://smithery.ai/badge/@hichana/goalstory-mcp)](https://smithery.ai/server/@hichana/goalstory-mcp)

Goal Story isn’t a goal tracker—it’s a brand new way to manage your aspirations. We call it “Goal Storying.” Instead of juggling endless lists, Goal Story guides you to focus on one goal at a time, forging a deeply personal narrative that keeps you motivated and on track. Powered by conversational AI, Goal Story provides constructive insights and creative storytelling tailored to your unique motivations, helping you see your goal through to completion with a sense of momentum and fun.

Goal Storying works because it weaves proven visualization techniques into your planning process. Research shows that using mental imagery when forming implementation intentions leads to higher rates of goal achievement.¹ By collaborating with an AI “thought partner,” you’ll generate personally meaningful stories that tap into your intrinsic motivators, priming both your mind and emotions to move forward. It’s not about ticking boxes—it’s about intuitive goal management that meets you where you are and adapts with you.

At the heart of this approach lies Goal Story’s “Goal Engine,” which transforms the typical, often dull process of goal tracking into an engaging, fun, and deeply resonant experience. With every completed goal, your insights and progress are securely captured, so you can reflect and build on them in the future. You don’t have to abandon your usual tools—track your tasks wherever you like. Goal Story simply turns goal-tracking into a dynamic story that evolves, energizes, and empowers you to achieve what matters most.

¹ See abastract on [Research Gate](https://www.researchgate.net/publication/225722903_Using_Mental_Imagery_to_Enhance_the_Effectiveness_of_Implementation_Intentions)

## Get an API key

Go to [GoalStory.ing](https://www.goalstory.ing/) to sign up/in and get a free API key.

## Server config

The last two args are picked up in the MCP server and utilized like env vars. They are also used with the MCP inspector in the npm script that runs it and the MCP server locally, so no need to manually add in the inspector UI if you're developing your own MCP server.

```
"goalStory": {
    "command": "npx",
    "args": ["-y", "goalstory-mcp", "https://prod-goalstory-rqc2.encr.app", "your-api-key"]
}
```
