export const createUserSchema = {
    email: value => {
        if(!value){
            return {message: 'Email is required'};
        }

        if(typeof value !== 'string' || !/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(value)){
            return {message: 'Email shoud be valid adress'};
        } 

        return null;
    },
    password: value => {
        if(!value) {
            return {message: 'Password is required'};
        }

        if (typeof value !== 'string' || value.length < 8 || value.length > 25) {
            return {message: 'Password should be a string in range [8..25]'};
        }

        return null;
    },
    first_name: value => {
        if(!value) {
            return {message: 'First name is required'};
        }

        if (typeof value !== 'string' || value.length < 1 || value.length > 25) {
            return {message: 'First name should be a string in range [1..25]'};
        }

        return null;
    },
    last_name: value => {
        if(!value) {
            return {message: 'Last name is required'};
        }

        if (typeof value !== 'string' || value.length < 1 || value.length > 25) {
            return {message: 'Last name should be a string in range [1..25]'};
        }

        return null;
    }
}
