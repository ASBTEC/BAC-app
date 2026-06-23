import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FilterOption {
  key: string;
  label: string;
  iconName?: string;
}

interface FilterDropdownProps {
  value: string;
  options: FilterOption[];
  onChange: (key: string) => void;
  allLabel?: string;
  /** Custom icon renderer — receives the key, the resolved icon color, and size. Used for SVG icons. */
  renderIcon?: (key: string, color: string, size: number) => React.ReactNode;
}

export function FilterDropdown({
  value,
  options,
  onChange,
  allLabel = 'Todos',
  renderIcon,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { height: screenH } = useWindowDimensions();

  const isActive = value !== 'all';
  const triggerLabel = isActive ? (options.find((o) => o.key === value)?.label ?? '') : allLabel;

  const icon = (key: string, active: boolean, forTrigger = false) => {
    const color = forTrigger ? '#fff' : (active ? BACColors.teal : colors.text);
    const size = forTrigger ? 18 : 22;
    if (renderIcon) return renderIcon(key, color, size);
    const iconName = options.find((o) => o.key === key)?.iconName;
    if (iconName) return <MaterialIcons name={iconName as any} size={size} color={color} />;
    return <View style={{ width: size }} />;
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[
          styles.trigger,
          { backgroundColor: isActive ? BACColors.teal : colors.card, borderColor: isActive ? BACColors.teal : colors.border },
        ]}
        onPress={() => setOpen(true)}>
        {isActive && icon(value, true, true)}
        <Text style={[styles.triggerText, { color: isActive ? '#fff' : colors.text }]} numberOfLines={1}>
          {triggerLabel}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={isActive ? '#fff' : colors.icon} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border, maxHeight: screenH * 0.72 }]}>
            <Pressable
              style={[styles.option, value === 'all' && { backgroundColor: BACColors.teal + '22' }]}
              onPress={() => { onChange('all'); setOpen(false); }}>
              <View style={styles.iconSlot} />
              <Text style={[styles.optionText, { color: value === 'all' ? BACColors.teal : colors.text }]}>
                {allLabel}
              </Text>
              {value === 'all' && <MaterialIcons name="check" size={18} color={BACColors.teal} />}
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <ScrollView bounces={false}>
              {options.map(({ key, label }) => {
                const active = value === key;
                return (
                  <Pressable
                    key={key}
                    style={[styles.option, active && { backgroundColor: BACColors.teal + '22' }]}
                    onPress={() => { onChange(key); setOpen(false); }}>
                    {icon(key, active)}
                    <Text style={[styles.optionText, { color: active ? BACColors.teal : colors.text }]}>
                      {label}
                    </Text>
                    {active && <MaterialIcons name="check" size={18} color={BACColors.teal} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 2,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sheet: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconSlot: { width: 22 },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: { height: 1 },
});
