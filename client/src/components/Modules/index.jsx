import React, { Component } from 'react';
import { NonIdealState, Button } from '@blueprintjs/core';
import PropTypes from 'prop-types';
import NProgress from 'nprogress';
import Module from './Module';
import ModuleForm from './ModuleForm';
import Header from '../Header';
import * as pathsAPI from '../../api/paths';
import * as modulesAPI from '../../api/modules';
import { IS_LOADING, INACTIVE, HAS_ERRORED } from '../../constants';

import '../../assets/css/modules.css';

class Modules extends Component {
  state = {
    path: null,
    modules: [],
    moduleFormShown: false,
    activeModuleId: null,
    requestStates: {
      fetchPath: IS_LOADING,
      createModule: INACTIVE
    }
  };

  constructor(props) {
    super(props);
    NProgress.start();
  }

  componentDidMount() {
    const { pathId } = this.props.match.params;
    pathsAPI.getPath(pathId)
      .then(async (path) => {
        await this.setState({
          path,
          activeModuleId: (path.modules.length === 0) ? null : path.modules[0]._id,
          modules: path.modules || []
        });
        await this.setRequestState({ fetchPath: INACTIVE });
      })
      .catch(() => this.setRequestState({ fetchPath: HAS_ERRORED }))
      .finally(() => NProgress.done());
  }

  setRequestState = newStatus => (
    this.setState(prevState => ({
      requestStates: { ...prevState.requestStates, ...newStatus }
    }))
  )

  createModule = async (module) => {
    const pathId = this.state.path._id;
    this.setRequestState({ createModule: IS_LOADING });
    modulesAPI.createModule(pathId, module)
      .then(async (newModule) => {
        await this.setState(previousState => ({
          modules: [...previousState.modules, newModule],
          moduleFormShown: false
        }));
        this.setRequestState({ createModule: INACTIVE });
      })
      .catch(() => this.setRequestState({ createModule: HAS_ERRORED }));
  };

  updateModule = updatedModule => (
    this.setState((previousState) => {
      const modules = [...previousState.modules];
      const index = modules.findIndex(mod => mod._id === updatedModule._id);
      modules[index] = updatedModule;
      return { modules };
    })
  )

  deleteModule = async moduleId => (
    this.setState((previousState) => {
      const modules = [...previousState.modules].filter(mod => mod._id !== moduleId);
      return { modules };
    })
  )

  openModule = (id) => {
    const { activeModuleId } = this.state;
    if (id === activeModuleId) return;
    this.setState({ activeModuleId: id });
  }

  completeModule = async (moduleId) => {
    const { modules } = this.state;
    const index = modules.findIndex(mod => mod._id === moduleId);
    modules[index].isCompleted = true;
    this.setState({ modules });

    const nextModule = modules[index + 1] || null;
    if (nextModule) this.openModule(nextModule._id);
    else this.setState({ activeModuleId: null });
  }

  showModuleFrom = () => {
    this.setState({ moduleFormShown: true });
  }

  hideModuleForm = () => {
    this.setState({ moduleFormShown: false });
  }

  renderModule = (module) => {
    const { activeModuleId } = this.state;
    return (
      <Module
        key={module._id}
        module={module}
        completeModule={this.completeModule}
        openModule={() => this.openModule(module._id)}
        isOpen={activeModuleId === module._id}
        updateModule={this.updateModule}
        deleteModule={this.deleteModule}
      />
    );
  }

  renderEmptyState = () => (
    <NonIdealState
      title="No modules yet"
      description={(
        <p>
          This learning path does not have any modules yet<br />
          As soon as you create one, it will displayed here.
        </p>
      )}
      action={<Button type="button" intent="primary" onClick={this.showModuleFrom}>create one now</Button>}
    />
  )

  renderErrorState = () => (
    <NonIdealState
      title="Something went wrong"
      icon="error"
      description={(
        <p>
          A problem occurred while fetching learning paths. This is
          likely due to a problem with your internet connection.<br />
        </p>
      )}
    />
  )

  render() {
    const {
      requestStates, modules, moduleFormShown, path
    } = this.state;
    const { user } = this.props;

    if (requestStates.fetchPath === IS_LOADING) return <p />;

    const $modules = modules
      .sort((m1, m2) => m2.createdAt - m1.createdAt)
      .map(this.renderModule);

    let $nonIdealState;
    if (modules.length === 0) $nonIdealState = this.renderEmptyState();
    else if (requestStates.fetchPath === HAS_ERRORED) $nonIdealState = this.renderErrorState();

    return (
      <div className="container module-container">
        <Header user={user} />
        <header className="module-container__header">
          <h2>{path ? path.title : null}</h2>
          { user && <Button type="button" icon="plus" intent="primary" onClick={this.showModuleFrom}>new module</Button>}
        </header>
        <ModuleForm
          isShown={moduleFormShown}
          onClose={this.hideModuleForm}
          requestStatus={requestStates.createModule}
          submit={this.createModule}
          user={user}
        />
        {$nonIdealState}
        <div className="modules">
          {$modules}
        </div>
      </div>
    );
  }
}

Modules.defaultProps = {
  user: null
};

Modules.propTypes = {
  // eslint-disable-next-line
  match: PropTypes.object.isRequired,
  user: PropTypes.shape({})
};

export default Modules;
