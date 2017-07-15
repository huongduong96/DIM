import angular from 'angular';
import Popper from 'popper.js';

angular.module('dimApp')
  .directive('itemPopup', ItemPopup);

/**
 * Common functionality for positioning a popup next to an item (or
 * item-like thing).  To use, add the "item-popup" attribute to the
 * root of your ngDialog template, and pass the element you want to
 * pop next to in the "data" option of the ngDialog call.  If you want
 * an arrow to show, also include a (properly styled) element with the
 * class "arrow" somewhere in your popup template.
 */
function ItemPopup() {
  return {
    restrict: 'A',
    link: ItemPopupLink
  };
}

function ItemPopupLink($scope, $element, $attrs) {
  'ngInject';
  const vm = this;

  // Capture the dialog element
  let dialog = null;
  $scope.$on('ngDialog.opened', (event, $dialog) => {
    dialog = $dialog;
    vm.reposition();
  });

  let popper;
  $scope.$on('$destroy', () => {
    if (popper) {
      popper.destroy();
    }
  });

  function findDialogData() {
    let scope = $scope;
    let element = scope.ngDialogData;
    while (!element && scope.$parent) {
      scope = scope.$parent;
      element = scope.ngDialogData;
    }
    return element;
  }

  // Reposition the popup as it is shown or if its size changes
  vm.reposition = function() {
    const element = findDialogData();
    if (element) {
      if (popper) {
        popper.scheduleUpdate();
      } else {
        const popperOptions = {
          placement: 'top-start',
          eventsEnabled: false,
          modifiers: {
            preventOverflow: {
              priority: ['bottom', 'top', 'right', 'left']
            },
            flip: {
              behavior: ['top', 'bottom', 'right', 'left']
            },
            offset: {
              offset: '0,5px'
            },
            arrow: {
              element: '.arrow'
            }
          }
        };

        const boundariesElement = $attrs.itemPopupBoundaryClass ? document.getElementsByClassName($attrs.itemPopupBoundaryClass)[0] : undefined;
        if (boundariesElement) {
          popperOptions.modifiers.preventOverflow.boundariesElement = boundariesElement;
          popperOptions.modifiers.flip.boundariesElement = boundariesElement;
        }

        popper = new Popper(element, dialog[0], popperOptions);
        popper.scheduleUpdate(); // helps fix arrow position
      }
    }
  };
}
