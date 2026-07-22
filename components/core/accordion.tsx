"use client"
import { motion, AnimatePresence, type Transition, type Variants, type Variant, MotionConfig } from "framer-motion"
import { cn } from "@/lib/utils"
import React, { createContext, useContext, useState, type ReactNode, useEffect, useCallback, useMemo } from "react"

export type AccordionContextType = {
  expandedValue: React.Key | null
  toggleItem: (value: React.Key) => void
  variants?: { expanded: Variant; collapsed: Variant }
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined)

function useAccordion() {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error("useAccordion must be used within an AccordionProvider")
  }
  return context
}

export type AccordionProviderProps = {
  children: ReactNode
  variants?: { expanded: Variant; collapsed: Variant }
  expandedValue?: React.Key | null
  onValueChange?: (value: React.Key | null) => void
}

function AccordionProvider({
  children,
  variants,
  expandedValue: externalExpandedValue,
  onValueChange,
}: AccordionProviderProps) {
  const [internalExpandedValue, setInternalExpandedValue] = useState<React.Key | null>(externalExpandedValue ?? null)

  // Use useEffect to handle external value changes after hydration
  useEffect(() => {
    if (externalExpandedValue !== undefined) {
      setInternalExpandedValue(externalExpandedValue)
    }
  }, [externalExpandedValue])

  const toggleItem = useCallback(
    (value: React.Key) => {
      setInternalExpandedValue((prev) => {
        const newValue = prev === value ? null : value
        onValueChange?.(newValue)
        return newValue
      })
    },
    [onValueChange],
  )

  const contextValue = useMemo(
    () => ({
      expandedValue: internalExpandedValue,
      toggleItem,
      variants,
    }),
    [internalExpandedValue, toggleItem, variants],
  )

  return (
    <AccordionContext.Provider value={contextValue}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return React.cloneElement(child, {
          ...child.props,
          value: child.props.value ?? child.key,
        })
      })}
    </AccordionContext.Provider>
  )
}

export type AccordionProps = {
  children: ReactNode
  className?: string
  transition?: Transition
  variants?: { expanded: Variant; collapsed: Variant }
  expandedValue?: React.Key | null
  onValueChange?: (value: React.Key | null) => void
}

function Accordion({ children, className, transition, variants, expandedValue, onValueChange }: AccordionProps) {
  return (
    <MotionConfig transition={transition}>
      <div className={cn("relative", className)} aria-orientation="vertical">
        <AccordionProvider variants={variants} expandedValue={expandedValue} onValueChange={onValueChange}>
          {children}
        </AccordionProvider>
      </div>
    </MotionConfig>
  )
}

export type AccordionItemProps = {
  value: React.Key
  children: ReactNode
  className?: string
}

function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { expandedValue } = useAccordion()
  const isExpanded = value === expandedValue

  return (
    <div
      className={cn("overflow-hidden", className)}
      {...(isExpanded ? { "data-expanded": "" } : { "data-closed": "" })}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            value,
            expanded: isExpanded,
          })
        }
        return child
      })}
    </div>
  )
}

export type AccordionTriggerProps = {
  children: ReactNode
  className?: string
}

function AccordionTrigger({ children, className, ...props }: AccordionTriggerProps) {
  const { toggleItem, expandedValue } = useAccordion()
  const value = (props as { value?: React.Key }).value
  const isExpanded = value === expandedValue

  return (
    <button
      onClick={() => value !== undefined && toggleItem(value)}
      aria-expanded={isExpanded}
      type="button"
      className={cn("group", className)}
      {...(isExpanded ? { "data-expanded": "" } : { "data-closed": "" })}
    >
      {children}
    </button>
  )
}

export type AccordionContentProps = {
  children: ReactNode
  className?: string
}

function AccordionContent({ children, className, ...props }: AccordionContentProps) {
  const { expandedValue, variants } = useAccordion()
  const value = (props as { value?: React.Key }).value
  const isExpanded = value === expandedValue

  const BASE_VARIANTS: Variants = {
    expanded: {
      height: "auto",
      opacity: 1,
      scale: 1,
      transition: {
        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      },
    },
    collapsed: {
      height: 0,
      opacity: 0,
      scale: 0.98,
      transition: {
        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      },
    },
  }

  const combinedVariants = {
    expanded: { ...BASE_VARIANTS.expanded, ...variants?.expanded },
    collapsed: { ...BASE_VARIANTS.collapsed, ...variants?.collapsed },
  }

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          variants={combinedVariants}
          className={cn("will-change-transform", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
