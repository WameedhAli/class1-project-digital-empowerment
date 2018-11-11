import React, { Component } from 'react';
import Module from './Module';
import ModuleForm from './ModuleForm';
import * as api from '../../api/modules';

import '../../assets/css/modules.css';

class Modules extends Component {
  state = {
    modules: [],
    moduleFormShown: false
  };

  componentDidMount() {
    api.getModules().then((modules) => {
      this.setState({ modules });
    });
  }

  createModule = (module) => {
    api.createModule(module).then((newModule) => {
      this.setState(previousState => ({
        newTitle: '',
        modules: [...previousState.modules, newModule],
        moduleFormShown: false
      }));
    });
  };

  updateModule = (module) => {
    api.updateModule(module).then((updatedModule) => {
      this.setState((previousState) => {
        const modules = [...previousState.modules];
        const index = modules.findIndex(mod => mod._id === module._id);
        modules[index] = updatedModule;
        return { modules };
      });
    });
  };

  deleteModule = (module) => {
    api.deleteModule(module._id).then(() => {
      this.setState((previousState) => {
        const modules = [...previousState.modules].filter(mod => mod._id !== module._id);
        return { modules };
      });
    });
  }

  showModuleFrom = () => {
    this.setState({ moduleFormShown: true });
  }

  hideModuleForm = () => {
    this.setState({ moduleFormShown: false });
  }

  render() {
    const { modules, moduleFormShown } = this.state;

    return (
      <div className="container module-container">
        <header className="module-container__header">
          <h2>Using a web browser</h2>
          <button type="button" className="button" onClick={this.showModuleFrom}>Add module</button>
        </header>
        <ModuleForm
          isShown={moduleFormShown}
          onClose={this.hideModuleForm}
          submit={this.createModule}
        />
        <div className="modules">
          { modules.length > 0
            ? modules
              .sort((m1, m2) => m2.createdAt - m1.createdAt)
              .map(module => (
                <Module
                  key={module._id}
                  module={module}
                  deleteModule={this.deleteModule}
                  updateModule={this.updateModule}
                />
              ))
            : <p>There are no modules yet</p>
          }
        </div>
      </div>
    );
  }
}

export default Modules;