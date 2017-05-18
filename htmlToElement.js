import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import htmlparser from 'htmlparser2-without-node-native';
import entities from 'entities';

import AutoSizedImage from './AutoSizedImage';

const LINE_BREAK = '\n';
const PARAGRAPH_BREAK = '\n\n';
const BULLET = '\u2022 ';

const Img = props => {
  const width = Number(props.attribs['width']) || Number(props.attribs['data-width']) || 0;
  const height = Number(props.attribs['height']) || Number(props.attribs['data-height']) || 0;
  const padding = props.padding || 0;

  const imgStyle = {
    width,
    height,
    padding,
  };
  const source = {
    uri: props.attribs.src,
  };
  return (
    <AutoSizedImage source={source} style={imgStyle} />
  );
};

export default function htmlToElement(rawHtml, opts, done) {

  function domToElement(dom, parent) {
    if (!dom) return null;

    return dom.map((node, index, list) => {


      let linkPressHandler;
      if(parent && parent.name == 'a' && node.type == 'text') {
        linkPressHandler = () => opts.linkHandler(entities.decodeHTML(parent.attribs.href));
      }


      if (opts.customRenderer) {
        const rendered = opts.customRenderer(node, index, list, parent, domToElement);
        if (rendered || rendered === null) return rendered;
      }

      if(node.data == '\n') {
        return null;
      }

      if (node.type == 'text') {
        return (
          <Text onPress={linkPressHandler} key={index} style={parent ? opts.styles[parent.name] : null}>
            {entities.decodeHTML(node.data)}
          </Text>
        );
      }

      if (node.type == 'tag') {
        if (node.name == 'img') {
          return (
            <Img key={index} attribs={node.attribs} style={ opts.styles[node.name] } padding={ opts.padding } />
          );
        }

        if (node.name == 'br') {
          return (
            <Text key={index}>{'\n'}</Text>
          );
        }

        let linebreakBefore = null;
        let linebreakAfter = null;
        if (opts.addLineBreaks) {
          switch (node.name) {
          case 'pre':
            linebreakBefore = LINE_BREAK;
            break;
          case 'p':
            if (index < list.length - 1) {
              linebreakAfter = PARAGRAPH_BREAK;
            }
            break;
          case 'br':
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
            linebreakAfter = LINE_BREAK;
            break;
          }
        }

        if (node.name == 'ul' || node.name == 'ol') {
          return (
            <View style={ opts.styles[node.name] } key={index}>
              {domToElement(node.children, node)}
            </View>
          );
        }

        let listItemPrefix = null;
        if (node.name == 'li') {
          if (parent.name == 'ol') {
            listItemPrefix = `${(index + 1) / 2}. `;
          } else if (parent.name == 'ul') {
            listItemPrefix = BULLET;
          }
          return(
            <View key={index}>
              <Text style={ opts.styles[node.name] }>
                <Text>{listItemPrefix}</Text>
                {domToElement(node.children, node)}
              </Text>
            </View>
          );
        }

        if (node.parent == null)
        {
          return (
            <View key={index} onPress={linkPressHandler}>
              <Text style={ opts.styles[node.name] }>
                {domToElement(node.children, node)}
              </Text>
            </View>
          );
        }

        return (
          domToElement(node.children, node)
        );
      }
    });
  }

  const handler = new htmlparser.DomHandler(function(err, dom) {
    if (err) done(err);
    done(null, domToElement(dom));
  });
  const parser = new htmlparser.Parser(handler);
  parser.write(rawHtml);
  parser.done();
}
