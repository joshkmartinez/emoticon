import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
} from 'react-native';
import Camera from 'react-native-camera';
import RNFetchBlob from 'react-native-fetch-blob';
import Orientation from 'react-native-orientation';
import AnimatedButton from './components/AnimatedButton';



class App extends Component {
  constructor(props) {
    super(props);

    // Initialize the component's state.
    this.state = {
      emotion: 'emotionless',   // 'emotionless' maps to the camera emoji 📷
      rotation: 0,              // Initial rotation of the device
    };
  }

  // This function is called when a picture is captured.
  takePicture() {
    const options = {}; // We don't need to modify these options
    this.camera.capture({ metadata: options })
    .then((result) => {
      this.findEmotions(result.data);
      this.setState({ emotion: 'loading' });
    })
    .catch(err => console.error(err));
  }

  // This function calls the Emotion API with our subscription key.
  findEmotions = data => {
    const url = 'https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize';

    RNFetchBlob.fetch('POST', url, {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': 'f0674c11f91247fba6afd138f7246f63',
    }, data)
    .then(result => this.setEmotion(result.json()))
  }

  // This function takes the data the API returns and sets our
  // 'emotion' state to the strongest emotion the API detected
  // on the user's face.
  setEmotion(data) {

    // If there are no faces on the screen, let our emotion be 'empty'.
    if (!Array.isArray(data) || data.length === 0) {
      return this.setState({ emotion: 'empty' });
    }

    const { scores } = data[0];   // Check only the largest face
    const emotions = Object.keys(scores); // Get a list of possible emotions
    const results = [];   // Create an array to contain our list of emotions

    // Push each emotion value to the 'results' array.
    for (const emotion of emotions) {
      results.push({
        emotion: emotion,
        value: scores[emotion],
      });
    }

    // Sort the 'results' array to find the strongest emotion.
    const sortedResults = results.sort((a, b) => b.value - a.value);

    // Return the strongest emotion.
    return this.setState({ emotion: sortedResults[0].emotion });
  }

  render() {
    // Shortcut to use state values without this.state
    // (for example, 'this.state.rotation' can now be called 'rotation').
    const { emotion, rotation } = this.state;

    return (
      <View style={styles.container}>
        <Camera
          style={styles.preview}
          ref={(cam) => this.camera = cam}
          type={Camera.constants.Type.front}
          captureTarget={Camera.constants.CaptureTarget.memory}
        >
          <AnimatedButton
            emotion={emotion}
            rotation={rotation}
            onPress={this.takePicture.bind(this)}
          />
        </Camera>
      </View>
    );
  }

/*------The below functions have to do with tracking device orientation------*/

  componentWillMount() {
    // Get the initial device orientation.
    const initial = Orientation.getInitialOrientation();
    this.handleOrientationChange(initial);
  }

  componentDidMount() {
    // Periodically check device orientation.
    Orientation.addSpecificOrientationListener(this.handleOrientationChange);
  }

  handleOrientationChange = (orientation) => {
    // Once an orientation change is detected, this switch
    // statement will be called to determine a translation
    // between the orientation keyword and a numeric value
    // associated with that orientation.
    switch (orientation) {
      case 'LANDSCAPE-LEFT':
        this.setState({ rotation: 90 });
        break;
      case 'LANDSCAPE-RIGHT':
        this.setState({ rotation: 270 });
        break;
      case 'PORTRAIT':
        this.setState({ rotation: 0 });
        break;
      case 'PORTRAITUPSIDEDOWN':
        this.setState({ rotation: 180 });
        break;
      default:
        this.setState({ rotation: 0 });
        break;
    }
  }

  componentWillUnmount() {
    // Remove orientation checking when this component dies.
    Orientation.removeSpecificOrientationListener(this.handleOrientationChange);
  }
}

// The StyleSheet contains styles for some of our components.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
});

export default App;
