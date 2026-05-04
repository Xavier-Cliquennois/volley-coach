import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { findGlossaryTerm, getSortedAliases, GlossaryTerm } from '@/data/glossary';
import { colors, radius, spacing } from '@/theme';

type Token = { kind: 'plain' | 'term'; text: string; term?: GlossaryTerm };

function tokenize(text: string): Token[] {
  const aliases = getSortedAliases();
  if (aliases.length === 0) return [{ kind: 'plain', text }];
  const escaped = aliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  const tokens: Token[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const idx = match.index ?? 0;
    if (idx > last) {
      tokens.push({ kind: 'plain', text: text.slice(last, idx) });
    }
    const term = findGlossaryTerm(match[0]);
    if (term) {
      tokens.push({ kind: 'term', text: match[0], term });
    } else {
      tokens.push({ kind: 'plain', text: match[0] });
    }
    last = idx + match[0].length;
  }
  if (last < text.length) {
    tokens.push({ kind: 'plain', text: text.slice(last) });
  }
  return tokens;
}

type Props = {
  children: string;
  style?: any;
};

export function GlossaryText({ children, style }: Props) {
  const tokens = useMemo(() => tokenize(children), [children]);
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);

  return (
    <>
      <Text style={style}>
        {tokens.map((t, i) =>
          t.kind === 'term' && t.term ? (
            <Text
              key={i}
              onPress={() => t.term && setActiveTerm(t.term)}
              style={styles.termInline}
              suppressHighlighting
            >
              {t.text}
            </Text>
          ) : (
            <Text key={i}>{t.text}</Text>
          )
        )}
      </Text>
      <Modal
        transparent
        animationType="fade"
        visible={!!activeTerm}
        onRequestClose={() => setActiveTerm(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setActiveTerm(null)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{activeTerm?.label}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.modalBody}>{activeTerm?.definition}</Text>
            </ScrollView>
            <Pressable
              style={styles.modalButton}
              onPress={() => setActiveTerm(null)}
            >
              <Text style={styles.modalButtonText}>Fermer</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  termInline: {
    color: colors.primary,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  modalBody: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  modalButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.bg,
    fontWeight: '700',
  },
});
