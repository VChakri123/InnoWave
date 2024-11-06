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
        var oTable = this.byId("idEmployeeTable");
        var aSelectedItems = oTable.getSelectedItems();

        if (aSelectedItems.length === 0) {
          MessageBox.warning("Please select a record to edit.");
          return;
        } else if (aSelectedItems.length > 1) {
          MessageBox.warning("Please select only one record to edit.");
          return;
        }

        // Get selected record data
        var oSelectedItem = aSelectedItems[0];
        var oContext = oSelectedItem.getBindingContext();
        var oData = oContext.getObject();

        //LOADING UPDATE FRAGMENT 
        if (!this._oEditDialog) {
          this._oEditDialog = await this.loadFragment("UpdateEmployee");
        }

        //Open dialog and set the existing data to inputs
        this.byId("idFirstNameInput1").setValue(oData.ID);
        this.byId("idLastNameInput1").setValue(oData.name);
        this.byId("idGenderInput1").setValue(oData.role);
        this.byId("idDOBInput1").setValue(oData.salary);

        this._oEditDialog.open();
      },

      onSaveEmployee: async function () {
        // Retrieve the input fields and their values
        var sName = this.byId("idLastNameInput1").getValue();
        var sRole = this.byId("idGenderInput1").getValue();
        var sSalary = this.byId("idDOBInput1").getValue();

        // Initialize validation flag
        var bValidationPassed = true;

        // Validate that all fields are required and at least 3 characters long
        if (sName.length < 3) {
          this.byId("idLastNameInput1").setValueState(sap.ui.core.ValueState.Error);
          this.byId("idLastNameInput1").setValueStateText("Name must contain at least 3 characters.");
          bValidationPassed = false;
        } else {
          this.byId("idLastNameInput1").setValueState(sap.ui.core.ValueState.None);
        }

        if (sRole.length < 3) {
          this.byId("idGenderInput1").setValueState(sap.ui.core.ValueState.Error);
          this.byId("idGenderInput1").setValueStateText("Role must contain at least 3 characters.");
          bValidationPassed = false;
        } else {
          this.byId("idGenderInput1").setValueState(sap.ui.core.ValueState.None);
        }

        if (sSalary.length < 3) {
          this.byId("idDOBInput1").setValueState(sap.ui.core.ValueState.Error);
          this.byId("idDOBInput1").setValueStateText("Salary must contain at least 3 characters.");
          bValidationPassed = false;
        } else {
          this.byId("idDOBInput1").setValueState(sap.ui.core.ValueState.None);
        }

        // If any validation fails, stop execution
        if (!bValidationPassed) {
          MessageBox.error("Please fill all fields with at least 3 characters.");
          return;
        }

        // Proceed with update if validation passed
        var oModel = this.getView().getModel("ModelV2");
        var oTable = this.byId("idEmployeeTable");

        // Create payload with updated data
        var oPayload = {
          name: sName,
          role: sRole,
          salary: sSalary,
        };

        // Define the update path for the selected item
        var sPath = oTable.getSelectedItem().getBindingContext().getPath();

        try {
          // Update the entry
          await new Promise((resolve, reject) => {
            oModel.update(sPath, oPayload, {
              success: resolve,
              error: reject,
            });
          });

          // Refresh table data and close the dialog
          oTable.getBinding("items").refresh();
          this._oEditDialog.close();
          MessageBox.success("Record updated successfully.");
        } catch (error) {
          MessageBox.error("Failed to update record.");
        }
      },

      onCloseDialog1: function () {
        this._oEditDialog.close();
      },

      //CREATE DATA
      onCreateEmployee: async function () {
        debugger;

        // Retrieve OData model and get user input values
        var oModel = this.getView().getModel("ModelV2");
        var oIdInput = this.byId("idFirstNameInput").getValue();
        var oNameInput = this.byId("idLastNameInput").getValue();
        var oRoleInput = this.byId("idGenderInput").getValue();
        var oSalaryInput = this.byId("idDOBInput").getValue();

        // Fetch the list of employees to check for existing IDs
        let allCricketList;
        try {
          allCricketList = await new Promise((resolve, reject) => {
            oModel.read("/Cricket", {
              success: function (oData) {
                resolve(oData.results);
              },
              error: function (oError) {
                reject(oError);
              },
            });
          });
        } catch (error) {
          MessageBox.error("Unable to fetch existing employees. Please try again.");
          return;
        }

        // Check if the ID already exists in the list
        const bAlreadExistedName = allCricketList.some((oName) => oName.name === oNameInput);
        if (bAlreadExistedName) {
          MessageBox.error("Employee Name already exists.");
          this.getView().byId("idLastNameInput").setValueState(sap.ui.core.ValueState.Error);
          this.getView().byId("idLastNameInput").setValueStateText("name should be unique.");
          return;
        }

        // Validation: Check if all fields have at least 3 characters
        if (oNameInput.length < 3 ||oRoleInput.length < 3 ||oSalaryInput.length < 3) {
          MessageBox.error("All fields must contain at least 3 characters.");
          return;
        }

        // Prepare payload
        var oPayload = {
          ID: oIdInput,
          name: oNameInput,
          role: oRoleInput,
          salary: oSalaryInput,
        };

        try {
          // Attempt to create a new employee
          await this.createData(oModel, oPayload, "/Cricket");
          this.getView().byId("idEmployeeTable").getBinding("items").refresh();
          this.byId("idCreateEMployeeDialog").close();
        } catch (error) {
          MessageBox.error("A technical error occurred while creating the employee.");
          return;
        }

        // Clear input fields after successful creation
        this.getView().byId("idFirstNameInput").setValue("");
        this.getView().byId("idLastNameInput").setValue("");
        this.getView().byId("idGenderInput").setValue("");
        this.getView().byId("idDOBInput").setValue("");
        this.getView().byId("idFirstNameInput").setValueState(sap.ui.core.ValueState.None);
      },

      onCloseDialog: function () {
        this.byId("idCreateEMployeeDialog").close();
      },

      //DELETING
      onPressDeleteBtn: function () {
        debugger;
        const oTable = this.byId("idEmployeeTable");
        const aSelectedItems = oTable.getSelectedItems();

        if (aSelectedItems.length === 0) {
          sap.m.MessageBox.error(
            "Please select at least one employee to delete!"
          );
          return;
        }

        // Gather names of selected employees
        const aEmployeeNames = aSelectedItems.map((item) => item.getBindingContext().getObject().name);
        const sEmployeeList = aEmployeeNames.join(", ");
        const oModel = this.getView().getModel("ModelV2");
        const oThis = this;

        // Show confirmation dialog with names of selected employees
        sap.m.MessageBox.confirm(`Are you sure you want to delete the following employees: ${sEmployeeList}?`,
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
                        sap.m.MessageBox.success("Employees deleted successfully.");
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
