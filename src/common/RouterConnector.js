import React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

export const SET_PATH = "router/SET_PATH"
export const REPLACE_PATH = "router/REPLACE_PATH"
export const RECOVER_PATH = "/pingback/"

const initialState = {}

/**
 * [routerReducer description]
 * @param {[type]} [state=initialState] [description]
 * @param {[type]} action [description]
 * @return {[type]} [description]
 */
export function routerReducer(state = initialState, action) {
  switch (action.type) {
    case SET_PATH:
      return { ...state, path: action.path, replace: false }
    case REPLACE_PATH:
      return { ...state, path: action.path, replace: true }
    default:
      return state
  }
}

/**
 * [setPath description]
 * @param {[type]} path [description]
 */
export function setPath(path) {
  return {
    type: SET_PATH,
    path
  }
}

/**
 * [replacePath description]
 * @param {[type]} path [description]
 */
export function replacePath(path) {
  return {
    type: REPLACE_PATH,
    path
  }
}

class RoutingConnector extends React.Component {
  componentDidMount() {
    if (this.context.router.history.location.pathname === this.props.recoverPath) {
      this.context.router.history.replace(this.props.path)
    } else {
      this.props.setPath(this.props.location.pathname)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path === nextProps.location.pathname) {
      return
    }

    // Sync from Redux
    if (nextProps.path !== this.props.path) {
      if (nextProps.replace === true) {
        this.context.router.history.replace(nextProps.path)
      } else {
        this.context.router.history.push(nextProps.path)
      }
    }

    // Sync to Redux
    if (nextProps.location !== this.props.location) {
      this.props.setPath(nextProps.location.pathname)
    }
  }

  render() {
    return <div>{this.props.children}</div>
  }
}

RoutingConnector.propTypes = {
  location: React.PropTypes.object,
  children: React.PropTypes.node,
  path: React.PropTypes.string,
  replace: React.PropTypes.bool,
  setPath: React.PropTypes.func,
  recoverPath: React.PropTypes.string
}

RoutingConnector.defaultProps = {
  recoverPath: RECOVER_PATH
}

RoutingConnector.contextTypes = {
  router: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    path: state.router.path,
    replace: state.router.replace
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setPath: (path) => dispatch(setPath(path))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoutingConnector))
