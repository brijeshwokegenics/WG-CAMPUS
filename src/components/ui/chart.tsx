
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: { COLOR_NAME: "var(--theme-color)" } }
const THEMES = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 84% 4.9%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(222.2 84% 4.9%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(222.2 84% 4.9%)",
    primary: "hsl(222.2 47.4% 11.2%)",
    primaryForeground: "hsl(210 40% 98%)",
    secondary: "hsl(210 40% 96.1%)",
    secondaryForeground: "hsl(222.2 47.4% 11.2%)",
    muted: "hsl(210 40% 96.1%)",
    mutedForeground: "hsl(215.4 16.3% 46.9%)",
    accent: "hsl(210 40% 96.1%)",
    accentForeground: "hsl(222.2 47.4% 11.2%)",
    destructive: "hsl(0 84.2% 60.2%)",
    destructiveForeground: "hsl(210 40% 98%)",
    border: "hsl(214.3 31.8% 91.4%)",
    input: "hsl(214.3 31.8% 91.4%)",
    ring: "hsl(222.2 84% 4.9%)",
  },
  dark: {
    background: "hsl(222.2 84% 4.9%)",
    foreground: "hsl(210 40% 98%)",
    card: "hsl(222.2 84% 4.9%)",
    cardForeground: "hsl(210 40% 98%)",
    popover: "hsl(222.2 84% 4.9%)",
    popoverForeground: "hsl(210 40% 98%)",
    primary: "hsl(210 40% 98%)",
    primaryForeground: "hsl(222.2 47.4% 11.2%)",
    secondary: "hsl(217.2 32.6% 17.5%)",
    secondaryForeground: "hsl(210 40% 98%)",
    muted: "hsl(217.2 32.6% 17.5%)",
    mutedForeground: "hsl(215 20.2% 65.1%)",
    accent: "hsl(217.2 32.6% 17.5%)",
    accentForeground: "hsl(210 40% 98%)",
    destructive: "hsl(0 62.8% 30.6%)",
    destructiveForeground: "hsl(210 40% 98%)",
    border: "hsl(217.2 32.6% 17.5%)",
    input: "hsl(217.2 32.6% 17.5%)",
    ring: "hsl(212.7 26.8% 83.9%)",
  },
}

const ChartContext = React.createContext<{
  config: {}
} | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: {}
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const anaylticsChartId = React.useId()
  const chartId = id || anaylticsChartId

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-area-area]:fill-[var(--color-area)] [&_.recharts-area-dot]:fill-[var(--color-dot)] [&_.recharts-area-gradient]:fill-[var(--color-gradient)] [&_.recharts-bar-bar]:fill-[var(--color-bar)] [&_.recharts-bar-area]:fill-[var(--color-area)] [&_.recharts-bar-rectangle]:fill-[var(--color-rectangle)] [&_.recharts-dot]:fill-[var(--color-dot)] [&_.recharts-label_text]:fill-foreground [&_.recharts-legend-wrapper]:!relative [&_.recharts-legend-wrapper]:!bottom-0 [&_.recharts-legend-wrapper]:!h-10 [&_.recharts-legend-wrapper]:!w-full [&_.recharts-polar-grid_line]:stroke-border [&_.recharts-polar-angle-axis_tick_text]:fill-muted-foreground [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-radial-bar-bar]:fill-[var(--color-bar)] [&_.recharts-reference-line_line]:stroke-border [&_.recharts-reference-line_label_text]:fill-foreground [&_.recharts-tooltip-cursor]:stroke-border [&_.recharts-tooltip-wrapper]:!text-sm [&_.recharts-tooltip-wrapper]:rounded-lg [&_.recharts-tooltip-wrapper]:border-border [&_.recharts-tooltip-wrapper]:bg-background [&_.recharts-tooltip-wrapper]:shadow-lg",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
    }
>(
  (
    {
      active,
      payload,
      label,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
    },
    ref
  ) => {
    if (!active || !payload || payload.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!hideLabel ? (
          <div className="font-medium text-muted-foreground">{label}</div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const indicatorColor = item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {!hideIndicator ? (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                      {
                        "h-2.5 w-2.5": indicator === "dot",
                        "w-1": indicator === "line",
                        "w-0": indicator === "none",
                      }
                    )}
                    style={
                      {
                        "--color-bg": indicatorColor,
                        "--color-border": indicatorColor,
                      } as React.CSSProperties
                    }
                  />
                ) : null}
                <div
                  className={cn(
                    "flex flex-1 justify-between leading-none",
                    indicator === "dot" && "items-center"
                  )}
                >
                  <div className="grid gap-1.5">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium text-foreground">
                      {item.value}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom" },
    ref
  ) => {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          verticalAlign === "top" ? "pb-3" : "pt-3"
        )}
      >
        <ul
          ref={ref}
          className={cn(
            "grid max-w-[calc(100%-2rem)] grid-flow-col gap-x-4 gap-y-1.5",
            className
          )}
        >
          {payload?.map((item) => {
            const indicatorColor = item.color

            return (
              <li
                key={item.value}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap text-muted-foreground"
                )}
              >
                {!hideIcon ? (
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: indicatorColor,
                    }}
                  />
                ) : null}
                {item.value}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
