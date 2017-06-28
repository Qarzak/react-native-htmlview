import React, { Component, PropTypes } from 'react';
import { Image, TouchableHighlight, View, Modal, Text } from 'react-native';
import ImageZoom from 'react-native-transformable-image';

export default class ZoomableImage extends Component {

static defaultProps = {
    source: PropTypes.object.isRequired,
    style: PropTypes.object.isRequired,
}

state = {
    modalVisible: false,
}

setModalVisible(visible) {
    this.setState({modalVisible: visible});
}

render() {

  return (
    <View style={{ marginTop: 70 }}>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {alert("Modal has been closed.")}}
          >
         <View style={{marginTop: 22}}>
            <ImageZoom source={this.props.source} style={this.props.style}/>
            <TouchableHighlight onPress={() => {
                this.setModalVisible(false)
            }}>
                <Text>Close Modal</Text>
            </TouchableHighlight>
         </View>
        </Modal>

        <TouchableHighlight onPress={() => {
          this.setModalVisible(true)
        }}>
          <Image source={this.props.source} style={this.props.style}/>
        </TouchableHighlight>
    </View>

   )
  }
}
