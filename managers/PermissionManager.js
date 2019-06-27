const fs     = xrequire('fs');
const yaml   = xrequire('js-yaml');

class PermissionManager {
    constructor (permissions) {
        // Properties
        this.permissions   = permissions;
        this.filePath      = global.VulcanDefaults.files.permissions.location;
        this.extensiveForm = {
            '1': 'root',
            '2': 'admin',
            '3': 'pleb'
        };
    }

    changePermissionLevel (userID, targetUserID, permissionLevel) {
        let currentPermission = this.getUserPermissions(targetUserID);
        if (this.getUserPermissions(userID) > 1)
            throw Error('Only roots may change permissions');
        if (currentPermission === 1)
            throw Error('You may not remove a root using a chat command');
        if (currentPermission === permissionLevel)
            throw Error('User already has this permission level');
        if (permissionLevel < 1 || permissionLevel > 3)
            throw Error('Invalid permission level');

        // remove current permission
        if (currentPermission !== 3)
            this.permissions = this.permissions.filter(e => e !== targetUserID);

        switch (permissionLevel) {
            case 1:
                this.permissions.roots.push(userID);
                break;
            case 2:
                this.permissions.admins.push(userID);
                break;
            default:
                break;
        }

        this.updatePermissionsFile();
    }

    updatePermissionsFile () {
        let newFile = yaml.safeDump(this.permissions);
        fs.writeFileSync(this.filePath, newFile, 'utf8');
    }

    getUserPermissions (ID, extensive = false) {
        let permission = 3;
        if (this.permissions.roots.includes(ID)) permission = 1;
        else if (this.permissions.admins.includes(ID)) permission = 2;

        if (extensive)
            return this.getExtensiveForm(permission);

        return permission;
    }

    getExtensiveForm (permissionLevel) {
        return this.extensiveForm[permissionLevel];
    }
}

module.exports = PermissionManager;
