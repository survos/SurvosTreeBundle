<?php

namespace Survos\Tree\Components;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Survos\Tree\Model\Column;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;
use Symfony\UX\TwigComponent\Attribute\PreMount;

#[AsTwigComponent('datatable', template: '@SurvosGrid/components/datatable.html.twig')]
class ItemGridComponent
{
    public function __construct() {}

    public ?iterable $data=null;
    public array $columns;
    public ?string $stimulusController='@survos/grid-bundle/item_tree';

    #[PreMount]
    public function preMount(array $parameters = []): array
    {
        $resolver = new OptionsResolver();
        $resolver->setDefaults([
            'data' => null,
            'class' => null,
            'caller' => null,
            'columns' => []
        ]);
        $parameters =  $resolver->resolve($parameters);
            return $parameters;

    }

    /** @return array<string, Column> */
    public function normalizedColumns(): iterable
    {
        $normalizedColumns = [];
        foreach ($this->columns as $c) {
            if (is_string($c)) {
                $c = ['name' => $c];
            }
            assert(is_array($c));
            $column = new Column(...$c);
            $normalizedColumns[$column->name] = $column;
        }
        return $normalizedColumns;
    }

}
