<?php

namespace Survos\Tree\Twig;

use ApiPlatform\Api\IriConverterInterface;
use ApiPlatform\Metadata\GetCollection;
use Survos\CoreBundle\Entity\RouteParametersInterface;
use Symfony\Component\PropertyAccess\PropertyAccessor;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\GetSetMethodNormalizer;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Twig\Environment;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;
use Symfony\WebpackEncoreBundle\Twig\StimulusTwigExtension;
use function Symfony\Component\String\u;

class TwigExtension extends AbstractExtension
{
    public function __construct(
        private SerializerInterface   $serializer,
        private NormalizerInterface   $normalizer,
        private UrlGeneratorInterface $generator,
        private IriConverterInterface|LegacyIriConverterInterface $iriConverter,
        private StimulusTwigExtension $stimulus)
    {
    }

    public function getFilters(): array
    {
        return [
            // If your filter generates SAFE HTML, you should add a third
            // parameter: ['is_safe' => ['html']]
            // Reference: https://twig.symfony.com/doc/3.x/advanced.html#automatic-escaping
            new TwigFilter('datatable', [$this, 'datatable'], ['needs_environment' => true, 'is_safe' => ['html']]),
        ];
    }


    public function getFunctions(): array
    {
        return [
            new TwigFunction('reverseRange', fn($x, $y) => sprintf("%s-%s", $x, $y)),
            new TwigFunction('api_route', [$this, 'apiCollectionRoute']),

            new TwigFunction('api_item_route', [$this, 'apiItemRoute']),
            new TwigFunction('api_subresource_route', [$this, 'apiCollectionSubresourceRoute']),
            new TwigFunction('sortable_fields', [$this, 'sortableFields']),
            new TwigFunction('searchable_fields', [$this, 'searchableFields']),
            new TwigFunction('api_table', [$this, 'apiTable'], ['needs_environment' => true, 'is_safe' => ['html']]),

            // survosCrudBundle?

        ];
    }

    public function sortableFields(string $class): array
    {
        assert(class_exists($class), $class);
        $reflector = new \ReflectionClass($class);
        foreach ($reflector->getAttributes() as $attribute) {
            if (!u($attribute->getName())->endsWith('ApiFilter')) {
                continue;
            }
            $filter = $attribute->getArguments()[0];
            if (u($filter)->endsWith('OrderFilter')) {

                $orderProperties = $attribute->getArguments()['properties'];
                return $orderProperties;
            }
        }
        return [];
    }

    public function searchableFields(string $class): array
    {

        $reflector = new \ReflectionClass($class);
        foreach ($reflector->getAttributes() as $attribute) {
            if (!u($attribute->getName())->endsWith('ApiFilter')) {
                continue;
            }
            $filter = $attribute->getArguments()[0];
            if (u($filter)->endsWith('MultiFieldSearchFilter')) {
                return $attribute->getArguments()['properties'];
            }
        }

        return [];
    }

    public function apiCollectionRoute($entityOrClass)
    {

        if ($this->iriConverter instanceof LegacyIriConverterInterface) {
            assert(false, $this->iriConverter::class);
            $x = $this->iriConverter->getIriFromResourceClass($entityOrClass);
        } else {
            $x = $this->iriConverter->getIriFromResource($entityOrClass, operation: new GetCollection());
        }
        return $x;
    }

    public function apiItemRoute($entity)
    {
        $x = $this->iriConverter->getIriFromResource($entity);
        return $x;
    }

    public function apiCollectionSubresourceRoute($entityOrClass, $identifiers)
    {

        $x = $this->iriConverter->getIriFromResource($entityOrClass,
            [
                'imdbId' => $this->apiItemRoute($entityOrClass),
                'property' => 'subtitles'
            ]
        )
            ;
        return $x;
    }



    public function datatable(Environment $env, iterable $data, array $headers = []): string
    {
        return "Generate the component...";

    }

    public function apiTable(Environment $env, string $class, array $attributes = []): string
    {

        assert(class_implements(RouteParametersInterface::class), "Class $class must implement RP");
        $controllers = [];
        $attributes['sortableFields'] = json_encode($this->sortableFields($class));
        $attributes['searchableFields'] = json_encode($this->searchableFields($class));
        $attributes['apiCall'] = $this->apiCollectionRoute($class);
        $attributes['prefix'] = $class::getPrefix();
        dd($attributes);
        $dtController = '@survos/tree-bundle/tree';
        $controllers[$dtController] = $attributes;

        $html = '<div ' . $this->stimulus->renderStimulusController($env, $controllers) . ' ';
//        foreach ($attributes as $name => $value) {
//            if ('data-controller' === $name) {
//                continue;
//            }
//
//            if (true === $value) {
//                $html .= $name.'="'.$name.'" ';
//            } elseif (false !== $value) {
//                $html .= $name.'="'.$value.'" ';
//            }
//        }

        $html .= trim($html) . '>';
        $html .= '</div>';
        $html .= "CLASS: " . $class;
        return $html;
    }

}
