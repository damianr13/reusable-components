import React, { useMemo } from "react";
import { ElectionResults } from "../../types/Election";
import { themable } from "../../util/theme";
import { HorizontalStackedBar, HorizontalStackedBarItem } from "../HorizontalStackedBar/HorizontalStackedBar";
import { PartyResultCard } from "../PartyResultCard/PartyResultCard";
import { PartyResultInline } from "../PartyResultInline/PartyResultInline";
import useDimensions from "react-use-dimensions";
import cssClasses from "./ElectionResultsStackedBar.module.scss";

type Props = {
  results: ElectionResults;
};

const maxStackedBarItems = 4;
const breakpoint1 = 850;
const breakpoint2 = 700;
const breakpoint3 = 330;
const defaultThemeValues = {
  neutralColor: "#B5B5B5",
};

const percentageOf = (x: number, total: number) => {
  const percent = x / total;
  return Number.isFinite(percent) ? percent : 0;
};

export const ElectionResultsStackedBar = themable<Props>(
  "ElectionResultsStackedBar",
  cssClasses,
  defaultThemeValues,
)(({ classes, results, themeValues }) => {
  const { candidates } = results;

  const [stackedBarItems, legendItems] = useMemo(() => {
    const items: (HorizontalStackedBarItem & {
      name: string;
      percent: number;
      logo?: string;
      index: number;
    })[] = [];

    const stackedBarCount = candidates.length === maxStackedBarItems + 1 ? maxStackedBarItems + 1 : maxStackedBarItems;
    for (let i = 0; i < stackedBarCount; i++) {
      const candidate = candidates[i];
      if (candidate) {
        const color = candidate.partyColor ?? themeValues.neutralColor;
        const percent = percentageOf(candidate.votes, results.validVotes);
        items.push({
          name: candidate.shortName ?? candidate.name,
          color,
          value: candidate.votes,
          percent,
          logo: candidate.partyLogo,
          index: items.length,
        });
      }
    }

    if (candidates.length > stackedBarCount) {
      let total = 0;
      for (let i = stackedBarCount; i < candidates.length; i++) {
        total += candidates[i].votes;
      }
      items.push({
        value: total,
        color: themeValues.neutralColor,
        name: "Alții",
        percent: percentageOf(total, results.validVotes),
        index: items.length,
      });
    }

    const stackItems = new Array(items.length);
    for (let i = 0; i < items.length; i++) {
      stackItems[i % 2 ? items.length - 1 - (i >> 1) : i >> 1] = items[i];
    }

    return [stackItems, items];
  }, [candidates]);

  const [measureRef, { width = Infinity }] = useDimensions();

  if (candidates.length === 0) {
    return null;
  }

  return (
    <div className={classes.root} ref={measureRef}>
      <div className={classes.cards}>
        {stackedBarItems.map(
          (item, index) =>
            (width >= breakpoint2 || item.index < 2) && (
              <PartyResultCard
                key={item.index}
                name={item.name}
                color={item.color}
                percentage={item.percent}
                iconUrl={(width >= breakpoint1 || item.index < 2) && width >= breakpoint3 ? item.logo : undefined}
                rightAligned={index === stackedBarItems.length - 1}
              />
            ),
        )}
      </div>
      <HorizontalStackedBar items={stackedBarItems} />
      <div className={classes.legend}>
        {legendItems.map((item) => (
          <PartyResultInline
            key={item.index}
            className={classes.legendItem}
            name={item.name}
            color={item.color}
            votes={item.value}
            percentage={item.percent}
          />
        ))}
      </div>
    </div>
  );
});
