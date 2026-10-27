import { describe, it, expect } from 'vitest';
import { matchTemplates, templateBreadcrumb, orderTemplateSections, phraseSimilarity, templateStem, type TemplateDefinition } from './templates';

const T: TemplateDefinition[] = [
  { id: 'pmh', title: 'Past medical history', abbreviations: ['PMH'], generic: true },
  { id: 'adm', title: 'General medical admission', generic: true, sections: [{ id: 'obs', title: 'Observations and findings', synonyms: ['o/e', 'examination'], children: [{ id: 'bp', title: 'Blood pressure' }] }] },
  { id: 'wells', title: "Wells' score for DVT", additional: true, contexts: ['Acute medicine'] },
  { id: 'chest', title: 'Chest pain assessment', contexts: ['Cardiology'] },
  { id: 'smoke', title: 'Smoking history', contexts: ['Respiratory'] },
];

describe('matchTemplates', () => {
  it('puts abbreviation matches first (Theme 4)', () => {
    expect(matchTemplates(T, 'pmh').templates[0].template.id).toBe('pmh');
    expect(matchTemplates(T, 'pmh').templates[0].via).toBe('abbreviation');
  });
  it('filters by context but keeps generic templates (Theme 1)', () => {
    const r = matchTemplates(T, 'a', { context: 'Cardiology' });
    expect(r.templates.map((m) => m.template.id)).not.toContain('wells');
    expect(matchTemplates(T, 'medical', { context: 'Cardiology' }).templates.map((m) => m.template.id)).toEqual(expect.arrayContaining(['pmh', 'adm']));
    expect(matchTemplates(T, 'wells', { context: 'Cardiology', filterEnabled: false }).templates).toHaveLength(1);
  });
  it('matches stems and section headings with paths (Themes 1, 2, 6)', () => {
    expect(templateStem('smokes')).toBe(templateStem('smoking'));
    expect(matchTemplates(T, 'smokes').templates[0].template.id).toBe('smoke');
    const s = matchTemplates(T, 'blood pres').sections[0];
    expect(s.section?.path).toEqual(['General medical admission', 'Observations and findings']);
    expect(matchTemplates(T, 'examination').sections[0].section?.title).toBe('Observations and findings');
    expect(phraseSimilarity('zzz', 'Chest pain')).toBe(0);
  });
  it('builds breadcrumbs and orders sections (Themes 2, 9)', () => {
    expect(templateBreadcrumb(['Observations and findings'], 'Blood pressure')).toBe('Observations and findings > Blood pressure');
    const added = [{ title: 'Plan' }, { title: 'Custom' }, { title: 'Presenting complaint' }];
    expect(orderTemplateSections(added, 'standard').map((s) => s.title)).toEqual(['Presenting complaint', 'Plan', 'Custom']);
    expect(orderTemplateSections(added, 'added')).toEqual(added);
  });
});

import { findTemplateTriggerPhrases } from './templates';

describe('findTemplateTriggerPhrases (Theme 6)', () => {
  const triggers = [
    { id: 'bp', phrases: ['blood pressure', 'BP'] },
    { id: 'pressure', phrases: ['pressure area'] },
    { id: 'smoking', phrases: ['smoking'] },
  ];
  it('tags the whole phrase, longest first, without overlaps', () => {
    const text = 'Blood pressure high. No pressure area damage. BP repeated.';
    const m = findTemplateTriggerPhrases(text, triggers);
    expect(m.map((x) => [x.triggerId, x.text])).toEqual([['bp', 'Blood pressure'], ['pressure', 'pressure area'], ['bp', 'BP']]);
    expect(text.slice(m[0].start, m[0].end)).toBe('Blood pressure');
  });
  it('matches word endings fuzzily and only whole words', () => {
    expect(findTemplateTriggerPhrases('She smokes 10 a day', triggers).map((x) => x.text)).toEqual(['smokes']);
    expect(findTemplateTriggerPhrases('BPH noted', triggers)).toEqual([]);
    expect(findTemplateTriggerPhrases('pressure only', triggers)).toEqual([]);
  });
});
