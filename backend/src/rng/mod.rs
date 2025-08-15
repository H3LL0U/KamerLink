use rand;
use rand::Rng;

pub fn generate_slots() -> Vec<u8>{
    let mut rng = rand::rng();
    
    //generate 3 numbers from one to (including) 7
    let numbers: Vec<u8> = (1..=7) 
        .map(|_| rng.random_range(1..=3))
        .collect();
    numbers
}