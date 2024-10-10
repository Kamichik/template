import React, { useEffect, useState } from 'react';
import { ReactECharts } from './Echarts/ReactECharts';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Theme, presetGpnDefault } from '@consta/uikit/Theme';
import './App.css';

interface CurrencyData {
  indicator: string;
  month: string;
  value: number;
}

function filterByCurrency(
  data: CurrencyData[],
  currency: string
): CurrencyData[] {
  switch (currency) {
    case '$':
      return data.filter(
        (currencyOnDate) => currencyOnDate.indicator === 'Курс доллара'
      );
    case '€':
      return data.filter(
        (currencyOnDate) => currencyOnDate.indicator === 'Курс евро'
      );
    case '¥':
      return data.filter(
        (currencyOnDate) => currencyOnDate.indicator === 'Курс юаня'
      );
    default:
      return [];
  }
}

function setOptions(filteredArray: CurrencyData[], item: string) {
  const option = {
    color: ['#c23531'],
    title: {
      text: getLineTitle(filteredArray, item),
      textStyle: {
        fontSize: 20,
        lineHeight: 30,
        fontFamily: 'Inter',
        fontWeight: '700',
        color: '#002033',
      },
    },
    grid: {
      left: '30px',
      right: '30px',
      bottom: '20px',
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: filteredArray.map((data) => data.month),
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value' as const,
      scale: true,
      splitNumber: 3,
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
      axisLabel: {
        showMinLabel: false,
      },
    },
    tooltip: {
      trigger: 'axis',
      textStyle: {
        color: '#002033',
        fontWeight: '700',
      },
      className: 'tooltip',
      extraCssText: 'border: none; width: 10vw;',
    },
    series: [
      {
        name: filteredArray[0]?.indicator,
        data: filteredArray.map((data) => data.value),
        type: 'line',
        itemStyle: {
          color: '#F38B00',
          type: 'none',
          opacity: '0',
        },
        lineStyle: {
          width: '2',
        },
      },
    ],
  };
  return option;
}


function getLineTitle(filteredArray: CurrencyData[], currency: string): string {
  if (filteredArray[0] && 'indicator' in filteredArray[0]) {
    return `${filteredArray[0].indicator.toUpperCase()}, ${currency}/₽`;
  }
  return '';
}

const App: React.FC = () => {
  const items: string[] = ['$', '€', '¥'];
  const [fetchedData, setFetchedData] = useState<CurrencyData[] | undefined>(
    undefined
  );
  const [average, setAverage] = useState<number | undefined>(undefined);
  const [item, setItem] = useState<string>(items[0]);
  const [data, setData] = useState<ReturnType<typeof setOptions> | undefined>(
    undefined
  );

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          'https://6706923ca0e04071d2276bd7.mockapi.io/api/v1/currencyData'
        );
        const data: CurrencyData[] = await response.json();
        setFetchedData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    if (fetchedData) {
      changeCurrency({ value: item });
    }
  }, [fetchedData]);

  function findAverage(
    acc: number,
    currentValue: CurrencyData,
    index: number,
    currencyArray: CurrencyData[]
  ): number {
    const sum = acc + currentValue.value;

    if (index === currencyArray.length - 1) {
      return sum / currencyArray.length;
    }
    return sum;
  }

  function changeCurrency(e: { value: string }): void {
    const currency = e.value;
    setItem(currency);
    const filteredCurrency = filterByCurrency(fetchedData || [], currency);
    const option = setOptions(filteredCurrency, currency);
    setData(option);
    const averageForCurrentCurrency = filteredCurrency.reduce(findAverage, 0);
    setAverage(averageForCurrentCurrency);
  }

  return (
    <article className="main">
      {data && <ReactECharts option={data} style={{ width: '53.33vw' }} />}
      {data && (
        <div className="right-side">
          <Theme preset={presetGpnDefault}>
            <ChoiceGroup
              value={item}
              onChange={changeCurrency}
              items={items}
              name="ChoiceGroupExample"
              getItemLabel={(item) => item}
              multiple={false}
              className="choice-group"
              size="xs"
            />
          </Theme>
          <dl className="average">
            <dt className="average__text">Среднее за период</dt>
            <dd className="average__group">
              <span className="average__value">{average?.toFixed(1)}</span>
              <data className="average__currency" value="RUB">
                ₽
              </data>
            </dd>
          </dl>
        </div>
      )}
    </article>
  );
};

export default App;
