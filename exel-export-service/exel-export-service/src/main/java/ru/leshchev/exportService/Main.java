package ru.leshchev.exportService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import ru.leshchev.exportService.service.LotService;

@SpringBootApplication
public class Main {



    private final LotService servicesService;


    @Autowired
    public Main(LotService servicesService) {
        this.servicesService = servicesService;

    }


    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }


//    @Bean
//    public CommandLineRunner demo() {
//        return args -> {
//// Здесь можно добавить код для тестирования вашего приложения
//// Например, вызвать методы вашего сервиса для создания, чтения, обновления и удаления данных
//// и выводить результаты на консоль
//
//
//// Пример:
//            Owner owner = new Owner();
//            owner.setName("John");
//            owner.setEmail("john@example.com");
//            owner.setPhone("123456789");
//            ownerService.createOwner(owner);
//
//
//            Pet pet = new Pet();
//            pet.setOwner(owner);
//            pet.setName("Fido");
//            pet.setAnimalType("Dog");
//            pet.setBreed("Golden Retriever");
//            pet.setAge(3);
//            pet.setVaccinations("All");
//            petService.createPet(pet);
//
//
//            Owner savedOwner = ownerService.getOwnerById(owner.getId());
//            System.out.println("Saved Owner: " + savedOwner);
//
//
//            Pet savedPet = petService.getPetById(pet.getId());
//            System.out.println("Saved Pet: " + savedPet);
//        };
//    }
}
