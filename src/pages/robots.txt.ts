// Crawl rules. Everything is allowed. The named groups are there so the intent is explicit and so it is obvious
// which lines to change later.
//
// A crawler follows only the one group that names it (a named group replaces the `*` group, it does not add to it),
// so a rule added under `*` will not reach the crawlers named below.

// Search and answer crawlers: these decide whether the site can appear in Google, Bing, ChatGPT, Claude, Perplexity and Apple results.
const ANSWER_BOTS = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Applebot'];
// Crawlers that collect text to train AI models. Blocking them does not remove the site from search or from live
// AI answers. To opt out of training only, change "Allow: /" to "Disallow: /" for this group.
const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

const group = (agents: string[]) => agents.map((a) => `User-agent: ${a}`).join('\n') + '\nAllow: /\n';

export const GET = ({ site }: { site?: URL }) =>
  new Response(
    [
      '# Search and answer crawlers',
      group(ANSWER_BOTS),
      '# Crawlers that collect text for AI training',
      group(TRAINING_BOTS),
      '# Everyone else',
      'User-agent: *\nAllow: /\n',
      `Sitemap: ${new URL('/sitemap.xml', site).href}\n`,
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
