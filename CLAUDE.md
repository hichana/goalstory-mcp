# Goal Story MCP Server

Model Context Protocol server enabling Claude to interact directly with the Goal Story platform through 20+ specialized tools.

## Server Architecture

- **Protocol**: MCP (Model Context Protocol) using `@modelcontextprotocol/sdk`
- **Implementation**: TypeScript with stateless proxy design
- **API Integration**: HTTP client connecting to Goal Story backend
- **Authentication**: Bearer token passthrough from command line arguments
- **Entry Point**: `src/index.ts` with tool registration and request handling

## Quick Commands

**Development**: `npm run dev` (builds + runs inspector + watches for changes)
**Build**: `npm run build`
**Tests**: `npm run test`
**Inspector**: `npm run inspect` (for debugging MCP tools)

## Key Files

- `src/index.ts` - Main server implementation with all MCP tools
- `src/tools.ts` - Tool definitions and schemas
- `src/prompts.ts` - MCP prompt definitions for goal storying workflows
- `src/resources.ts` - Static resource content
- `src/types.ts` - TypeScript type definitions
- `package.json` - Dependencies and npm scripts

## MCP Tools Available

The server provides comprehensive goal management tools:

**User Management**:
- `about_goalStorying` - Get platform information
- `read_self_user` - Read current user data
- `update_self_user` - Update user profile

**Goal Management**:
- `count_goals` - Count user's goals
- `create_goal` - Create new goal
- `read_goals` - List goals with pagination
- `read_one_goal` - Get specific goal
- `update_goal` - Update goal details
- `destroy_goal` - Delete goal

**Step Management**:
- `create_steps` - Create multiple steps for a goal
- `read_steps` - List steps for a goal
- `read_one_step` - Get specific step
- `update_step` - Update step details
- `update_step_notes` - Update step notes
- `set_steps_order` - Reorder steps using timestamp-based ordering
- `destroy_step` - Delete step

**Story Management**:
- `create_story` - Create motivational story
- `read_stories` - List stories for goal/step
- `read_one_story` - Get specific story
- `get_story_context` - Get context for story generation

**Scheduling**:
- `read_scheduled_stories` - List scheduled story generation
- `create_scheduled_story` - Schedule story generation
- `update_scheduled_story` - Update schedule
- `destroy_scheduled_story` - Delete schedule

**Focus Management**:
- `read_current_focus` - Get current goal/step focus

## Tool Design Principles

### Comprehensive Coverage
All major Goal Story platform operations are available as MCP tools:
- **User Management**: Profile reading and updates
- **Goal Operations**: Full CRUD operations with pagination
- **Step Management**: Creation, ordering, and note editing
- **Story Generation**: AI content creation and retrieval
- **Scheduling**: Automated story generation management
- **Focus Tracking**: Current goal/step identification

### API Fidelity
- **Direct Proxy**: Tools mirror Goal Story API endpoints exactly
- **Authentication**: Bearer token authentication passed through
- **Error Handling**: API errors surfaced to Claude with context
- **Data Integrity**: Timestamp-based step ordering for race-condition prevention

### Claude Integration
- **JSON Responses**: Structured data that Claude can parse and present
- **Tool Descriptions**: Rich metadata for Claude's tool selection
- **Parameter Validation**: Schema-based input validation
- **Inspector Support**: Development debugging at http://127.0.0.1:6274

## Configuration & Deployment

### Command Line Arguments
1. **API Base URL**: `http://localhost:4000` (local) or `https://prod-goalstory-rqc2.encr.app` (prod)
2. **API Token**: User's API key from Goal Story platform

### Claude Desktop Integration
```json
"goalStory": {
    "command": "npx",
    "args": ["-y", "goalstory-mcp", "https://prod-goalstory-rqc2.encr.app", "your-api-key"]
}
```

### Development Workflow
1. Start Goal Story API: `cd api && npm run dev`
2. Start MCP server: `cd goalstory-mcp && npm run dev`  
3. Test tools: Use inspector at http://127.0.0.1:6274
4. Run tests: `npm run test` (requires both API and MCP server running)