import React, { Component } from 'react';
import {
  View,
  Text,
  Easing,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

function emotionToEmoji(emotion) {
  switch (emotion) {
    case 'anger':
      return '😡';
    case 'contempt':
      return '😤';
    case 'disgust':
      return '🤢';
    case 'fear':
      return '😱';
    case 'happiness':
      return '😄';
    case 'neutral':
      return '😐';
    case 'sadness':
      return '😖';
    case 'surprise':
      return '😱';
    case 'emotionless':
      return '📷';
    case 'loading':
      return '🔆';
    default:
      return '☂️';
  }
}

class AnimatedButton extends Component {
  static propTypes = {
    onPress: PropTypes.func,
    emotion: PropTypes.string,
    rotation: PropTypes.number,
  };

  constructor(props) {
    super(props);

    // Create an animated value to animate the
    // rotation of the capture button.
    this.spinValue = new Animated.Value(0);
  }

  // This function spins our button.
  spin() {
    // Set 'spinValue' to zero to initialize rotation.
    this.spinValue.setValue(0);

    // Check if we are still loading results.
    if (this.props.emotion === 'loading')
    {
      // Configure the animation.
      const config = {
        toValue: 360,          // Change 'spinValue' from 0 to 360
        duration: 1000,        // over the course of 1000ms
        easing: Easing.linear, // at constant speed.
      };

      // Animate the spinValue with the parameters above, and when
      // 'spinValue === 360', we call spin again.
      Animated.timing(this.spinValue, config).start(() => this.spin());
    }
  }

  componentDidUpdate() {
    // Spin the button if we are loading results, otherwise
    // rotate the button to match the current device orientation.
    if (this.props.emotion === 'loading') {
      this.spin();
    } else {
      const config = {
        toValue: this.props.rotation, // Change 'spinValue' to match rotation
        duration: 500,                // over the course of 500ms
        easing: Easing.cubic,         // starting slow, then moving fast.
      };

      // Animate 'spinValue' with the parameters above.
      Animated.timing(this.spinValue, config).start();
    }
  }

  render() {
    // Shortcut to use state values without this.props
    // (for example, 'this.props.rotation' can now be called 'rotation').
    const { onPress, emotion, rotation } = this.props;

    // Translate 'spinValue' into a string named 'spin'.
    const spin = this.spinValue.interpolate({
      inputRange: [0, 360],            // Take a number (0 to 360)
      outputRange: ['0deg', '360deg'], // Return a string ('0deg' to '360deg')
    });

    // The style of the animated button.
    const buttonAnimation = {
      alignItems: 'center',
      height: 70,
      width: 70,
      transform: [{ rotate: spin }],
    };

    return(
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
      >
        <Animated.View style={buttonAnimation}>
          <Text style={{ fontSize: 60 }}>
            {emotionToEmoji(emotion)}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    flex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 5,
    padding: 10,
    margin: 40,
  }
});

export default AnimatedButton;
