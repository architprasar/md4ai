import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { builtinPromptTopics, defineBridge, getBridgePrompt, getPrompt, parse, parseBridgeData, renderContent } from '../.test-dist/test/entry.js';

test('parse resolves registered bridges using their declared pattern', () => {
  const statusBridge = defineBridge({
    marker: 'status',
    pattern: 'scalar',
    render: () => null,
  });

  const nodes = parse('Build is @status[passing].', { bridges: [statusBridge] });

  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, 'paragraph');
  assert.deepEqual(nodes[0].children, [
    { type: 'text', value: 'Build is ' },
    { type: 'bridge', marker: 'status', raw: 'passing', data: 'passing' },
    { type: 'text', value: '.' },
  ]);
});

test('parse leaves emails, mentions, and unknown markers as plain text', () => {
  const statusBridge = defineBridge({
    marker: 'status',
    pattern: 'scalar',
    render: () => null,
  });

  const nodes = parse(
    'Email ops@example.com, ping @john, keep @unknown[raw], and render @status[pending].',
    { bridges: [statusBridge] },
  );

  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, 'paragraph');
  assert.deepEqual(nodes[0].children, [
    {
      type: 'text',
      value: 'Email ',
    },
    {
      type: 'link',
      href: 'mailto:ops@example.com',
      children: [{ type: 'text', value: 'ops@example.com' }],
    },
    {
      type: 'text',
      value: ', ping @john, keep @unknown[raw], and render ',
    },
    { type: 'bridge', marker: 'status', raw: 'pending', data: 'pending' },
    { type: 'text', value: '.' },
  ]);
});

test('parse applies built-in keyvalue bridge parsing before render time', () => {
  const kpiBridge = defineBridge({
    marker: 'kpi',
    pattern: 'keyvalue',
    render: () => null,
  });

  const nodes = parse('@kpi[value: $167k, label: East Revenue, change: +18%]', {
    bridges: [kpiBridge],
  });

  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, 'paragraph');
  assert.deepEqual(nodes[0].children, [
    {
      type: 'bridge',
      marker: 'kpi',
      raw: 'value: $167k, label: East Revenue, change: +18%',
      data: {
        value: '$167k',
        label: 'East Revenue',
        change: '+18%',
      },
    },
  ]);
});

test('parseBridgeData exposes the built-in bridge parsers for reuse', () => {
  assert.deepEqual(parseBridgeData('array', 'East, North, APAC'), ['East', 'North', 'APAC']);
  assert.deepEqual(parseBridgeData('range', '100 -> 500'), { min: '100', max: '500' });
});

test('defineBridge falls back to raw bridge data when a custom parser throws', () => {
  const flakyBridge = defineBridge({
    marker: 'flaky',
    pattern: () => {
      throw new Error('bad bridge payload');
    },
    render: () => null,
  });

  const nodes = parse('Result: @flaky[still-visible]', { bridges: [flakyBridge] });
  assert.equal(nodes[0].type, 'paragraph');
  assert.deepEqual(nodes[0].children[1], {
    type: 'bridge',
    marker: 'flaky',
    raw: 'still-visible',
    data: 'still-visible',
  });
});

test('defineBridge rejects invalid marker names up front', () => {
  assert.throws(() => defineBridge({
    marker: 'Bad Marker',
    pattern: 'scalar',
    render: () => null,
  }), /Invalid bridge marker/);
});

test('getBridgePrompt builds a combined bridge prompt string', () => {
  const statusBridge = defineBridge({
    marker: 'status',
    pattern: 'scalar',
    render: () => null,
  });
  const badgeBridge = defineBridge({
    marker: 'badge',
    pattern: 'scalar',
    render: () => null,
  });

  const prompt = getBridgePrompt([statusBridge, badgeBridge], {
    prefix: 'You may use these inline markers:',
  });

  assert.match(prompt, /You may use these inline markers:/);
  assert.match(prompt, /@status/);
  assert.match(prompt, /@badge/);
});

test('getBridgePrompt supports selecting a subset of bridges', () => {
  const statusBridge = defineBridge({
    marker: 'status',
    pattern: 'scalar',
    render: () => null,
  });
  const badgeBridge = defineBridge({
    marker: 'badge',
    pattern: 'scalar',
    render: () => null,
  });

  const prompt = getBridgePrompt([statusBridge, badgeBridge], {
    include: ['badge'],
  });

  assert.doesNotMatch(prompt, /@status/);
  assert.match(prompt, /@badge/);
});

test('getPrompt includes built-in md4ai syntax guidance by default', () => {
  const prompt = getPrompt();

  assert.match(prompt, /standard markdown by default/i);
  assert.match(prompt, /GitHub-style callouts/i);
  assert.match(prompt, /::kpi/);
});

test('getPrompt minimal mode stays compact but keeps fallback guidance', () => {
  const prompt = getPrompt({
    mode: 'minimal',
    includeBuiltins: ['kpi', 'steps'],
    includeBridgePrompts: false,
  });

  assert.match(prompt, /Write normal markdown by default/i);
  assert.match(prompt, /If unsure, fall back to plain markdown/i);
  assert.match(prompt, /::kpi/);
  assert.match(prompt, /```steps/);
  assert.doesNotMatch(prompt, /Example:/);
});

test('getPrompt withExamples mode includes canonical examples', () => {
  const prompt = getPrompt({
    mode: 'withExamples',
    includeBuiltins: ['kpi', 'steps'],
    includeBridgePrompts: false,
  });

  assert.match(prompt, /Example:/);
  assert.match(prompt, /::kpi\{label="Revenue"/);
  assert.match(prompt, /- \[done\] Gather requirements/);
});

test('getPrompt supports selecting only some built-in topics', () => {
  const prompt = getPrompt({
    includeBuiltins: ['kpi', 'tables'],
    includeBaseInstruction: false,
    includeBridgePrompts: false,
  });

  assert.match(prompt, /::kpi/);
  assert.match(prompt, /markdown tables/i);
  assert.doesNotMatch(prompt, /GitHub-style callouts/i);
});

test('getPrompt standard mode keeps guardrails without full examples', () => {
  const prompt = getPrompt({
    mode: 'standard',
    includeBuiltins: ['tables', 'callouts'],
    includeBridgePrompts: false,
  });

  assert.match(prompt, /fall back to plain markdown/i);
  assert.match(prompt, /GitHub-style callouts/i);
  assert.doesNotMatch(prompt, /Example:/);
});

test('getPrompt can combine built-ins with a selected subset of bridges', () => {
  const paymentBridge = defineBridge({
    marker: 'payment',
    pattern: 'keyvalue',
    render: () => null,
  });
  const releaseBridge = defineBridge({
    marker: 'release',
    pattern: 'keyvalue',
    render: () => null,
  });

  const prompt = getPrompt({
    bridges: [paymentBridge, releaseBridge],
    includeBuiltins: ['buttons'],
    includeBridges: ['payment'],
  });

  assert.match(prompt, /::button/);
  assert.match(prompt, /@payment/);
  assert.doesNotMatch(prompt, /@release/);
});

test('builtinPromptTopics exposes the supported built-in prompt selections', () => {
  assert.deepEqual(builtinPromptTopics, [
    'callouts',
    'charts',
    'steps',
    'kpi',
    'cards',
    'layout',
    'buttons',
    'inputs',
    'video',
    'tables',
  ]);
});

test('renderContent falls back to visible source when a bridge renderer throws', () => {
  const unstableBridge = defineBridge({
    marker: 'unstable',
    pattern: 'scalar',
    render: () => {
      throw new Error('render crash');
    },
  });

  const nodes = parse('Check @unstable[now].', { bridges: [unstableBridge] });
  const html = renderToStaticMarkup(renderContent(nodes, { bridges: [unstableBridge] }));

  assert.match(html, /@unstable\[now\]/);
});
