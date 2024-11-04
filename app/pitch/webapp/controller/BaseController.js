sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
     "sap/ui/core/Fragment",
  ],
  function (BaseController, Fragment) {
    "use strict";

    return BaseController.extend("com.app.pitch.controller.BaseController", {
      onInit: function () {
      },

      //LOADING THE FRAGMENT
      loadFragment: async function (sFragmentName) {
        const oFragment = await Fragment.load({
          id: this.getView().getId(),
          name: `com.app.pitch.fragments.${sFragmentName}`,
          controller: this
        });
        this.getView().addDependent(oFragment);
        return oFragment
      },

      //CREATING THE DATA 
      createData: function (oModel, oPayload, sPath) {
        return new Promise((resolve, reject) => {
          oModel.create(sPath, oPayload, {
            refreshAfterChange: true,
            success: function (oSuccessData) {
              resolve(oSuccessData);
            },
            error: function (oErrorData) {
              reject(oErrorData)
            }
          })
        })
      },

      //DELETING THE DATA
      deleteData: function (oModel, sPath, ID) {
        return new Promise((resolve, reject) => {
          oModel.remove(`${sPath}/${ID}`, {
            success: function (oSuccessData) {
              resolve(oSuccessData);
            },
            error: function (oErrorData) {
              reject(oErrorData)
            }
          })
        })
      }
    });
  }
);
