let data = {
    nama: 'ican',
    sex: 'man',
    age: 25,
}

let ubah = {
    nama: 'ikhsan',
    age: 24
}

data = {...data, ...ubah}

console.log(data)