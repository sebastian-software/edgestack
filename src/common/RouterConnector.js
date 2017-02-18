import React from "react"
import { connect } from "react-redux"

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
    this.context.router.listen(({ pathname }) => {
      if (this.props.path !== pathname) {
        this.props.setPath(pathname)
      }
    })

    if (this.context.router.location.pathname === this.props.recoverPath) {
      this.context.router.replace(this.props.path)
    } else {
      this.props.setPath(this.context.router.location.pathname)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path && this.props.path !== nextProps.path) {
      if (this.context.router.location.pathname !== nextProps.path) {
        // Will receive props means they are not yet set, so we have to wait
        // a little before updating the history. Otherwise stuff breaks.
        setTimeout(() => {
          if (nextProps.replace === true) {
            this.context.router.replace(nextProps.path)
          } else {
            this.context.router.push(nextProps.path)
          }
        }, 0)
      }
    }
  }

  render() {
    return <div>{this.props.children}</div>
  }
}

RoutingConnector.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(RoutingConnector)
