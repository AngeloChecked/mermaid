import { select } from "d3";
import { memoize } from "lodash";

export interface TextDimensionConfig {
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
}

export interface TextDimensions {
  width: number;
  height: number;
  lineHeight?: number;
}

export const parseFontSize = (fontSize: string | number | undefined): [number?, string?] => {
  // if the font size is a number, assume a px string representation
  if (typeof fontSize === 'number') {
    return [fontSize, fontSize + 'px'];
  }

  const fontSizeNumber = parseInt(fontSize ?? '', 10);
  if (Number.isNaN(fontSizeNumber)) {
    // if a number value can't be parsed, return null for both values
    return [undefined, undefined];
  } else if (fontSize === String(fontSizeNumber)) {
    // if a string input doesn't contain any units, assume px units
    return [fontSizeNumber, fontSize + 'px'];
  } else {
    return [fontSizeNumber, fontSize];
  }
};

export const lineBreakRegex = /<br\s*\/?>/gi;

export const getTextObj = function () {
  return {
    x: 0,
    y: 0,
    fill: undefined,
    anchor: 'start',
    style: '#666',
    width: 100,
    height: 100,
    textMargin: 0,
    rx: 0,
    ry: 0,
    valign: undefined,
    text: '',
  };
};

export const ZERO_WIDTH_SPACE = '\u200b';
export const drawSimpleText = function (
  elem: SVGElement,
  textData: {
    text: string;
    x: number;
    y: number;
    anchor: 'start' | 'middle' | 'end';
    fontFamily: string;
    fontSize: string | number;
    fontWeight: string | number;
    fill: string;
    class: string | undefined;
    textMargin: number;
  }
): SVGTextElement {
  // Remove and ignore br:s
  const nText = textData.text.replace(lineBreakRegex, ' ');

  const [, _fontSizePx] = parseFontSize(textData.fontSize);

  const textElem = elem.append('text') as any;
  textElem.attr('x', textData.x);
  textElem.attr('y', textData.y);
  textElem.style('text-anchor', textData.anchor);
  textElem.style('font-family', textData.fontFamily);
  textElem.style('font-size', _fontSizePx);
  textElem.style('font-weight', textData.fontWeight);
  textElem.attr('fill', textData.fill);

  if (textData.class !== undefined) {
    textElem.attr('class', textData.class);
  }

  const span = textElem.append('tspan');
  span.attr('x', textData.x + textData.textMargin * 2);
  span.attr('fill', textData.fill);
  span.text(nText);

  return textElem;
};


export const calculateTextDimensions: (
  text: string,
  config: TextDimensionConfig
) => TextDimensions = memoize(
  (text: string, config: TextDimensionConfig): TextDimensions => {
    const { fontSize = 12, fontFamily = 'Arial', fontWeight = 400 } = config;
    if (!text) {
      return { width: 0, height: 0 };
    }

    const [, _fontSizePx] = parseFontSize(fontSize);

    // We can't really know if the user supplied font family will render on the user agent;
    // thus, we'll take the max width between the user supplied font family, and a default
    // of sans-serif.
    const fontFamilies = ['sans-serif', fontFamily];
    const lines = text.split(lineBreakRegex);
    const dims: { width: number, height: number, lineHeight: number }[] = [];

    const body = select('body');
    // We don't want to leak DOM elements - if a removal operation isn't available
    // for any reason, do not continue.
    if (!body.remove) {
      return { width: 0, height: 0, lineHeight: 0 };
    }

    const g = body.append('svg');

    for (const fontFamily of fontFamilies) {
      let cHeight = 0;
      const dim = { width: 0, height: 0, lineHeight: 0 };
      for (const line of lines) {
        const textObj = getTextObj();
        textObj.text = line || ZERO_WIDTH_SPACE;
        // @ts-ignore TODO: Fix D3 types
        const textElem = drawSimpleText(g, textObj)
          // @ts-ignore TODO: Fix D3 types
          .style('font-size', _fontSizePx)
          .style('font-weight', fontWeight)
          .style('font-family', fontFamily);

        const bBox = (textElem._groups || textElem)[0][0].getBBox();
        if (bBox.width === 0 && bBox.height === 0) {
          throw new Error('svg element not in render tree');
        }
        dim.width = Math.round(Math.max(dim.width, bBox.width));
        cHeight = Math.round(bBox.height);
        dim.height += cHeight;
        dim.lineHeight = Math.round(Math.max(dim.lineHeight, cHeight));
      }
      dims.push(dim);
    }

    g.remove();

    const index =
      isNaN(dims[1].height) ||
      isNaN(dims[1].width) ||
      isNaN(dims[1].lineHeight) ||
      (dims[0].height > dims[1].height &&
        dims[0].width > dims[1].width &&
        dims[0].lineHeight > dims[1].lineHeight)
        ? 0
        : 1;
    return dims[index];
  },
  (text, config) => `${text}${config.fontSize}${config.fontWeight}${config.fontFamily}`
);
export function calculateTextHeight(
  text: Parameters<typeof calculateTextDimensions>[0],
  config: Parameters<typeof calculateTextDimensions>[1]
): ReturnType<typeof calculateTextDimensions>['height'] {
  return calculateTextDimensions(text, config).height;
}

export function calculateTextWidth(
  text: Parameters<typeof calculateTextDimensions>[0],
  config: Parameters<typeof calculateTextDimensions>[1]
): ReturnType<typeof calculateTextDimensions>['width'] {
  return calculateTextDimensions(text, config).width;
}

