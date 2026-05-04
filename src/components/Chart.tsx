import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors, radius, spacing } from '@/theme';

type Point = { x: number; y: number; label?: string };

type Props = {
  data: Point[];
  width?: number;
  height?: number;
  unit?: string;
  title?: string;
};

export function LineChart({ data, width = 320, height = 180, unit = '', title }: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.emptyText}>Pas encore de donnees</Text>
      </View>
    );
  }

  const padding = { top: 16, right: 16, bottom: 24, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;

  const project = (p: Point) => ({
    x: padding.left + ((p.x - minX) / xRange) * innerW,
    y: padding.top + innerH - ((p.y - minY) / yRange) * innerH,
  });

  const points = data.map(project);
  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  return (
    <View>
      {title && <Text style={styles.title}>{title}</Text>}
      <Svg width={width} height={height}>
        <Line
          x1={padding.left}
          y1={padding.top + innerH}
          x2={padding.left + innerW}
          y2={padding.top + innerH}
          stroke={colors.border}
          strokeWidth={1}
        />
        <Line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerH}
          stroke={colors.border}
          strokeWidth={1}
        />
        <SvgText x={padding.left - 4} y={padding.top + 4} fill={colors.textMuted} fontSize={10} textAnchor="end">
          {maxY.toFixed(1)}
          {unit}
        </SvgText>
        <SvgText
          x={padding.left - 4}
          y={padding.top + innerH}
          fill={colors.textMuted}
          fontSize={10}
          textAnchor="end"
        >
          {minY.toFixed(1)}
          {unit}
        </SvgText>
        <Path d={pathD} stroke={colors.primary} strokeWidth={2} fill="none" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.primary} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyText: { color: colors.textMuted },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
});
