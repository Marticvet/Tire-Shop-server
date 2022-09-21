export const createUserSchema = {
    email: value => {
        if(!value){
            return 'Email is required';
        }

        if(typeof value !== 'string' || !/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(value)){
            return 'Email shoud be valid adress';
        } 

        return null;
    },
    password: value => {
        if(!value) {
            return 'Password is required';
        }

        if (typeof value !== 'string' || value.length < 8 || value.length > 25) {
            return 'Password should be a string in range [8..25]';
        }

        return null;
    },
    first_name: value => {
        if(!value) {
            return 'First name is required';
        }

        if (typeof value !== 'string' || value.length < 1 || value.length > 25) {
            return 'First name should be a string in range [1..25]';
        }

        return null;
    },
    last_name: value => {
        if(!value) {
            return 'Last name is required';
        }

        if (typeof value !== 'string' || value.length < 1 || value.length > 25) {
            return 'Last name should be a string in range [1..25]';
        }

        return null;
    }
}
