import React from 'react';
import { Dimensions } from 'react-native';
import DrawerLayout from 'react-native-drawer-layout-polyfill';

import DrawerSidebar from './DrawerSidebar';
import DrawerActions from '../routers/DrawerActions';

/**
 * Component that renders the drawer.
 */
export default class DrawerView extends React.PureComponent {
  state = {
    drawerWidth:
      typeof this.props.navigationConfig.drawerWidth === 'function'
        ? this.props.navigationConfig.drawerWidth()
        : this.props.navigationConfig.drawerWidth,
  };

  componentDidMount() {
    Dimensions.addEventListener('change', this._updateWidth);
  }

  componentDidUpdate(prevProps) {
    const { isDrawerOpen } = this.props.navigation.state;
    const wasDrawerOpen = prevProps.navigation.state.isDrawerOpen;

    if (isDrawerOpen && !wasDrawerOpen && this._drawerState === 'closed') {
      this._drawerState = 'opening';
      this._drawer.openDrawer();
    } else if (wasDrawerOpen && !isDrawerOpen && this._drawerState === 'open') {
      this._drawerState = 'closing';
      this._drawer.closeDrawer();
    }
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this._updateWidth);
  }

  _drawerState = 'closed';

  _handleDrawerOpen = () => {
    const { navigation } = this.props;
    const { isDrawerOpen } = navigation.state;
    if (!isDrawerOpen && this._drawerState === 'closed') {
      navigation.dispatch({ type: DrawerActions.OPEN_DRAWER });
    }
    this._drawerState = 'open';
  };

  _handleDrawerClose = () => {
    const { navigation } = this.props;
    const { isDrawerOpen } = navigation.state;
    if (isDrawerOpen && this._drawerState === 'open') {
      navigation.dispatch({ type: DrawerActions.CLOSE_DRAWER });
    }
    this._drawerState = 'closed';
  };

  _updateWidth = () => {
    const drawerWidth =
      typeof this.props.navigationConfig.drawerWidth === 'function'
        ? this.props.navigationConfig.drawerWidth()
        : this.props.navigationConfig.drawerWidth;

    if (this.state.drawerWidth !== drawerWidth) {
      this.setState({ drawerWidth });
    }
  };

  _renderNavigationView = () => {
    return (
      <DrawerSidebar
        screenProps={this.props.screenProps}
        navigation={this.props.navigation}
        descriptors={this.props.descriptors}
        contentComponent={this.props.navigationConfig.contentComponent}
        contentOptions={this.props.navigationConfig.contentOptions}
        drawerPosition={this.props.navigationConfig.drawerPosition}
        style={this.props.navigationConfig.style}
        {...this.props.navigationConfig}
      />
    );
  };

  render() {
    const { state } = this.props.navigation;
    const activeKey = state.routes[state.index].key;
    const descriptor = this.props.descriptors[activeKey];

    const DrawerScreen = descriptor.getComponent();

    const { drawerLockMode } = descriptor.options;

    return (
      <DrawerLayout
        ref={c => {
          this._drawer = c;
        }}
        drawerLockMode={
          drawerLockMode ||
          (this.props.screenProps && this.props.screenProps.drawerLockMode) ||
          this.props.navigationConfig.drawerLockMode
        }
        drawerBackgroundColor={
          this.props.navigationConfig.drawerBackgroundColor
        }
        drawerWidth={this.state.drawerWidth}
        onDrawerOpen={this._handleDrawerOpen}
        onDrawerClose={this._handleDrawerClose}
        useNativeAnimations={this.props.navigationConfig.useNativeAnimations}
        renderNavigationView={this._renderNavigationView}
        drawerPosition={
          this.props.navigationConfig.drawerPosition === 'right'
            ? DrawerLayout.positions.Right
            : DrawerLayout.positions.Left
        }
      >
        <DrawerScreen
          screenProps={this.props.screenProps}
          navigation={descriptor.navigation}
        />
      </DrawerLayout>
    );
  }
}
