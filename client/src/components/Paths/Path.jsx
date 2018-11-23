import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faClone } from '@fortawesome/free-solid-svg-icons';
import ConfirmationDialog from '../ConfirmationDialog';

class Path extends Component {
  state = {
    confirmingDeletion: false,
    updatingPath: false
  };

  showPathForm = (e) => {
    e.stopPropagation();
  }

  promptConfirmDeletion = (e) => {
    e.stopPropagation();
    this.setState({ confirmingDeletion: true });
  }

  cancelDeletion = () => {
    this.setState({ confirmingDeletion: false });
  };

  showPathForm = (e) => {
    e.stopPropagation();
    this.setState({ updatingPath: true });
  }

  hideModuleForm = () => {
    this.setState({ updatingPath: false });
  }

  deletePath = () => {
    this.props.delete(this.props.path);
  }

  render() {
    const { confirmingDeletion } = this.state;
    const { path } = this.props;

    return (
      <article className="paths paths__path-wrapper">
        <ConfirmationDialog
          isOpen={confirmingDeletion}
          onClose={this.cancelDeletion}
          cancel={this.cancelDeletion}
          accept={this.deletePath}
          title="Confirm deletion"
          text={`Are you sure you want to delete path "${path.title}"`}
        />
        <button type="button" onClick={() => this.choosePath(path)} className="path button--seamless">
          {path.title}
          <div className="paths__actions">
            <i><FontAwesomeIcon icon={faClone} onClick={this.duplicatePath} /></i>
            <i><FontAwesomeIcon icon={faEdit} onClick={this.showPathForm} /></i>
            <i><FontAwesomeIcon icon={faTrash} onClick={this.promptConfirmDeletion} /></i>
          </div>
        </button>
      </article>
    );
  }
}

Path.propTypes = {
  path: PropTypes.shape({
    title: PropTypes.string.isRequired
  }).isRequired,
  choose: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  duplicate: PropTypes.func.isRequired
};

export default Path;
