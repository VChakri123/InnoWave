sap.ui.define(
  [
    "./BaseController",
    //"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.app.pitch.controller.Cric1", {
      onInit: function () {},

      //LOADING FRAGMENT OF ADDEMPLOYEE
      onCreateBtnPress: async function () {
        if (!this.oCreateEmployeeDialog) {
          this.oCreateEmployeeDialog = await this.loadFragment("AddEmployee");
        }
        this.oCreateEmployeeDialog.open();
      },

      //UPDATE
      onPressUpdateBtn: async function () {
        var oSelected = this.byId("idEmployeeTable").getSelectedItems();
        if (oSelected.length > 0) {

          var oID = this.byId("idEmployeeTable").getSelectedItem().getBindingContext().getProperty("ID");
          var oname = this.byId("idEmployeeTable").getSelectedItem().getBindingContext().getProperty("name");
          var orole = this.byId("idEmployeeTable").getSelectedItem().getBindingContext().getProperty("role");
          var osalary = this.byId("idEmployeeTable").getSelectedItem().getBindingContext().getProperty("salary");
           
          var newEmployee = new JSONModel({
            ID: oID,
            name: oname,
            role: orole,
            salary: osalary,
          });
          this.getView().setModel(newEmployee, "newEmployee1");

          // LOADING FRAGMENT OF UPDATE EMPLOYEE
          if (!this.oUpdateEmployeeDialog) {
            this.oUpdateEmployeeDialog = await this.loadFragment("UpdateEmployee");
          }
          this.oUpdateEmployeeDialog.open();
        } else {
          MessageToast.show("Please select Atleast one field");
        }
      },
      onCloseDialog1: function () {
        this.byId("idCreateEMployeeDialog1").close();
      },

      onSaveEmployee: function () {
        var oPayload = this.getView().getModel("newEmployee1").getData();
        var oDataModel = this.getOwnerComponent().getModel("ModelV2"); // Assuming this is your OData V2 model

        try {
          // Assuming your update method is provided by your OData V2 model
          oDataModel.update("/Cricket(" + oPayload.ID + ")", oPayload, {
            success: function () {
              this.getView()
                .byId("idEmployeeTable")
                .getBinding("items")
                .refresh();
              this.oUpdateEmployeeDialog.close();
              sap.m.MessageBox.success("Updated successfully");
            }.bind(this),
            error: function (oError) {
              this.oUpdateEmployeeDialog.close();
            }.bind(this),
          });
        } catch (error) {
          this.oUpdateEmployeeDialog.close();
          sap.m.MessageBox.error("Some technical Issue");
        }
      },

      //CREATE DATA
      onCreateEmployee: async function () {
        debugger;
        var oIdInput = this.byId("idFirstNameInput");
        var oNameInput = this.byId("idLastNameInput");
        var oRoleInput = this.byId("idGenderInput");
        var oSalaryInput = this.byId("idDOBInput");

        // Create payload object
        var oPayload = {
          ID: oIdInput.getValue(),
          name: oNameInput.getValue(),
          role: oRoleInput.getValue(),
          salary: oSalaryInput.getValue(),
        };

        var oModel = this.getView().getModel("ModelV2"); // Assume your OData model is set on the view

        try {
          await this.createData(oModel, oPayload, "/Cricket");
          this.getView().byId("idEmployeeTable").getBinding("items").refresh();
          this.byId("idCreateEMployeeDialog").close();
        } catch (error) {
          this.byId("idCreateEMployeeDialog").close();
          MessageBox.error("Some technical Issue");
        }
        this.getView().byId("idFirstNameInput").setValue("");
        this.getView().byId("idLastNameInput").setValue("");
        this.getView().byId("idGenderInput").setValue("");
        this.getView().byId("idDOBInput").setValue("");
      },

      onCloseDialog: function () {
        this.byId("idCreateEMployeeDialog").close();
      },
      onPressDeleteBtn: function () {
        debugger;
        const oTable = this.byId("idEmployeeTable");
        const aSelectedItems = oTable.getSelectedItems();

        if (aSelectedItems.length === 0) {
          sap.m.MessageBox.error("Please select at least one employee to delete!");
          return;
        }

        // Gather names of selected employees
        const aEmployeeNames = aSelectedItems.map(
          (item) => item.getBindingContext().getObject().name
        );
        const sEmployeeList = aEmployeeNames.join(", ");

        const oModel = this.getView().getModel("ModelV2");
        const oThis = this;

        // Show confirmation dialog with names of selected employees
        sap.m.MessageBox.confirm(
          `Are you sure you want to delete the following employees: ${sEmployeeList}?`,
          {
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: function (sAction) {
              if (sAction === sap.m.MessageBox.Action.YES) {
                let totalCount = aSelectedItems.length; // Total items to delete
                let successCount = 0; // Track successful deletions
                let hasDisplayedMessage = false; // Flag for success message

                aSelectedItems.forEach((item) => {
                  const oContext = item.getBindingContext();
                  const sPath = oContext.getPath();

                  oModel.remove(sPath, {
                    success: function () {
                      successCount++;
                      oThis
                        .getView()
                        .byId("idEmployeeTable")
                        .getBinding("items")
                        .refresh();

                      // Check if all deletions are successful
                      if (successCount === totalCount && !hasDisplayedMessage) {
                        sap.m.MessageBox.success(
                          "Employees deleted successfully."
                        );

                        hasDisplayedMessage = true; // Set the flag to true
                      }
                    },
                    error: function () {
                      sap.m.MessageToast.error("Failed to delete employee.");
                    },
                  });
                });
              }
            },
          }
        );
      },
    });
  }
);
